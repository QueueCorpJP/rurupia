import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/admin-client';
import { Database } from './database.types';
import { format } from 'date-fns';

type NotificationSettings = Database['public']['Tables']['notification_settings']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

type NotificationType = 'message' | 'booking' | 'promotion' | 'review' | 'system' | 'general' | 'follow' | 'like';

interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: Record<string, any>;
}

/**
 * Send notification to a user
 * Handles checking notification preferences and sending appropriate notifications
 */
export const sendNotification = async ({ 
  userId, 
  title, 
  message, 
  type = 'general', 
  data = {} 
}: {
  userId: string;
  title: string;
  message: string;
  type?: 'general' | 'message' | 'booking' | 'follow' | 'like' | 'review' | 'promotion' | 'system';
  data?: any;
}) => {
  try {
    console.log(`Sending ${type} notification to user ${userId}: ${title}`);
    
    // Check user's notification preferences
    let shouldSendEmail = false;
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (settingsError) {
      console.log('No notification settings found, using defaults');
      // Default to sending emails for important notification types
      shouldSendEmail = type === 'message' || type === 'booking' || type === 'system';
    } else {
      shouldSendEmail = checkShouldSendEmail(settings, type as NotificationType);
    }
    
    console.log(`Should send email for ${type} notification: ${shouldSendEmail}`);
    
    // Send email notification if enabled
    let emailSent = false;
    if (shouldSendEmail) {
      emailSent = await sendEmailNotification(userId, title, message, type as NotificationType, data);
      console.log(`Email notification sent: ${emailSent}`);
    }
    
    // Create in-app notification
    const { data: notificationData, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        data,
        email_sent: emailSent,
        read: false,
        created_at: new Date().toISOString()
      })
      .select();
      
    if (error) {
      console.error('Error sending notification:', error);
      return { success: false, error };
    }
    
    return { success: true, data: notificationData, emailSent };
  } catch (err) {
    console.error('Exception in sendNotification:', err);
    return { success: false, error: err };
  }
};

/**
 * Check if email should be sent based on user settings and notification type
 */
const checkShouldSendEmail = (settings: NotificationSettings, type: NotificationType): boolean => {
  if (!settings.email_notifications) {
    return false;
  }
  
  switch (type) {
    case 'message':
      return settings.message_notifications;
    case 'booking':
      return settings.booking_notifications;
    case 'promotion':
      return settings.promotion_notifications;
    case 'review':
      return settings.review_notifications;
    case 'system':
      return true; // System notifications are always sent if email_notifications is true
    default:
      return false;
  }
};

/**
 * Record notification in database for history/tracking
 */
const recordNotificationInDb = async ({ 
  userId, 
  title, 
  message, 
  type, 
  emailSent, 
  data 
}: NotificationData & { emailSent: boolean }): Promise<void> => {
  try {
    // Create the notification object
    const notification: NotificationInsert = {
      user_id: userId,
      title,
      message,
      type,
      email_sent: emailSent,
      data,
      read: false
    };

    // Insert into notifications table
    await supabaseAdmin
      .from('notifications')
      .insert(notification);
  } catch (error) {
    console.error('Error recording notification:', error);
  }
};

/**
 * Send actual email notification
 * Uses Supabase Edge Function to send emails via proper email service
 */
const sendEmailNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  data: Record<string, any>
): Promise<boolean> => {
  try {
    // Call Supabase Edge Function for email sending
    const { data: response, error } = await supabaseAdmin
      .functions
      .invoke('send-email-notification', {
        body: {
          userId,
          title,
          message,
          type,
          data
        }
      });
    
    if (error) {
      console.error('Error calling email notification function:', error);
      return false;
    }
    
    console.log('Email notification function response:', response);
    return response?.success || false;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

// Helper functions to send specific types of notifications
export const sendMessageNotification = (userId: string, fromUser: string, messagePreview: string) => {
  return sendNotification({
    userId,
    title: '新しいメッセージが届きました',
    message: `${fromUser}さんからメッセージが届きました: ${messagePreview}`,
    type: 'message',
    data: { fromUser, messagePreview }
  });
};

export const sendBookingNotification = (userId: string, therapistName: string, date: string, status: string) => {
  return sendNotification({
    userId,
    title: '予約状況の更新',
    message: `${therapistName}との予約が${status}になりました。日時: ${date}`,
    type: 'booking',
    data: { therapistName, date, status }
  });
};

// New notification for therapist when a booking is submitted
export const sendBookingNotificationToTherapist = async (therapistId: string, userName: string, bookingDateTime: Date) => {
  const formattedDate = bookingDateTime.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return sendNotification({
    userId: therapistId,
    title: '新しい予約リクエスト',
    message: `${userName}さんから${formattedDate}の予約リクエストが届きました`,
    type: 'booking',
    data: { 
      userName, 
      bookingDate: bookingDateTime.toISOString(),
      status: 'pending'
    }
  });
};

// New notification for store when a booking is submitted
export const sendBookingNotificationToStore = async (therapistId: string, userName: string, bookingDateTime: Date) => {
  try {
    // Find the store associated with this therapist via store_therapists table
    const { data: storeTherapistData, error: storeTherapistError } = await supabase
      .from('store_therapists')
      .select('store_id')
      .eq('therapist_id', therapistId)
      .eq('status', 'active')
      .single();
      
    if (storeTherapistError || !storeTherapistData?.store_id) {
      console.error('Error finding store for therapist:', storeTherapistError);
      return { success: false, error: storeTherapistError || 'No store associated with therapist' };
    }
    
    const storeId = storeTherapistData.store_id;
    
    const formattedDate = bookingDateTime.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Send notification directly to the store admin (store owner)
    return sendNotification({
      userId: storeId,
      title: '新しい予約リクエスト',
      message: `${userName}さんから${formattedDate}の予約リクエストが届きました`,
      type: 'booking',
      data: { 
        userName, 
        therapistId,
        bookingDate: bookingDateTime.toISOString(),
        status: 'pending'
      }
    });
  } catch (err) {
    console.error('Exception in sendBookingNotificationToStore:', err);
    return { success: false, error: err };
  }
};

// New notification for client when booking is confirmed by both therapist and store
export const sendBookingConfirmationToClient = async (userId: string, therapistName: string, bookingDateTime: Date) => {
  const formattedDate = bookingDateTime.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return sendNotification({
    userId,
    title: '予約が確定しました',
    message: `${therapistName}さんとの${formattedDate}の予約が確定しました`,
    type: 'booking',
    data: { 
      therapistName, 
      bookingDate: bookingDateTime.toISOString(),
      status: 'confirmed'
    }
  });
};

// New notification for client when booking is rejected by both therapist and store
export const sendBookingRejectionToClient = async (userId: string, therapistName: string, bookingDateTime: Date) => {
  const formattedDate = bookingDateTime.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return sendNotification({
    userId,
    title: '予約がキャンセルされました',
    message: `${therapistName}さんとの${formattedDate}の予約がキャンセルされました`,
    type: 'booking',
    data: { 
      therapistName, 
      bookingDate: bookingDateTime.toISOString(),
      status: 'cancelled'
    }
  });
};

// Notification when therapist responds to booking - notify store
export const sendTherapistResponseNotificationToStore = async (storeId: string, therapistName: string, bookingDateTime: Date, status: string) => {
  const formattedDate = bookingDateTime.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const statusText = status === 'confirmed' ? '承認' : status === 'cancelled' ? '拒否' : '更新';
  
  return sendNotification({
    userId: storeId,
    title: 'セラピストが予約に回答しました',
    message: `${therapistName}さんが${formattedDate}の予約を${statusText}しました`,
    type: 'booking',
    data: { 
      therapistName, 
      bookingDate: bookingDateTime.toISOString(),
      status,
      responseType: 'therapist'
    }
  });
};

// Notification when store responds to booking - notify therapist
export const sendStoreResponseNotificationToTherapist = async (therapistId: string, storeName: string, bookingDateTime: Date, status: string) => {
  const formattedDate = bookingDateTime.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const statusText = status === 'confirmed' ? '承認' : status === 'cancelled' ? '拒否' : '更新';
  
  return sendNotification({
    userId: therapistId,
    title: '店舗が予約に回答しました',
    message: `${storeName}が${formattedDate}の予約を${statusText}しました`,
    type: 'booking',
    data: { 
      storeName, 
      bookingDate: bookingDateTime.toISOString(),
      status,
      responseType: 'store'
    }
  });
};

export const sendReviewRequestNotification = (userId: string, therapistName: string, bookingId: string) => {
  return sendNotification({
    userId,
    title: 'セラピストのレビューをお願いします',
    message: `${therapistName}のセラピーはいかがでしたか？あなたの感想をお聞かせください。`,
    type: 'review',
    data: { therapistName, bookingId }
  });
};

export const sendPromotionNotification = (userId: string, title: string, message: string, data = {}) => {
  return sendNotification({
    userId,
    title,
    message,
    type: 'promotion',
    data
  });
};

export const sendFollowNotification = (userId: string, followerName: string) => {
  return sendNotification({
    userId,
    title: '新しいフォロワー',
    message: `${followerName}さんがあなたをフォローしました`,
    type: 'follow',
    data: { followerName }
  });
};

export const sendLikeNotification = (userId: string, likerName: string, postTitle: string) => {
  return sendNotification({
    userId,
    title: '投稿がいいねされました',
    message: `${likerName}さんがあなたの投稿「${postTitle}」にいいねしました`,
    type: 'like',
    data: { likerName, postTitle }
  });
};

// Notification for therapist when their application is approved
export const sendTherapistApprovalNotification = (therapistId: string, storeName: string) => {
  return sendNotification({
    userId: therapistId,
    title: 'セラピスト申請が承認されました',
    message: `${storeName}があなたのセラピスト申請を承認しました。ログインして詳細を確認してください。`,
    type: 'system',
    data: { storeName, status: 'approved' }
  });
};

// Notification for therapist when their application is rejected
export const sendTherapistRejectionNotification = (therapistId: string, storeName: string) => {
  return sendNotification({
    userId: therapistId,
    title: 'セラピスト申請が却下されました',
    message: `${storeName}があなたのセラピスト申請を却下しました。詳細については店舗にお問い合わせください。`,
    type: 'system',
    data: { storeName, status: 'rejected' }
  });
};

// Notification for when a therapist is deactivated
export const sendTherapistDeactivationNotification = (therapistId: string, storeName: string) => {
  return sendNotification({
    userId: therapistId,
    title: 'アカウントが無効化されました',
    message: `${storeName}があなたのアカウントを無効化しました。詳細については店舗にお問い合わせください。`,
    type: 'system',
    data: { storeName, status: 'deactivated' }
  });
}; 