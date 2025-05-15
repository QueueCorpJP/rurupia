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
  type?: 'general' | 'message' | 'booking' | 'follow' | 'like';
  data?: any;
}) => {
  try {
    console.log(`Sending ${type} notification to user ${userId}: ${title}`);
    
    const { data: notificationData, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        data,
        read: false,
        created_at: new Date().toISOString()
      })
      .select();
      
    if (error) {
      console.error('Error sending notification:', error);
      return { success: false, error };
    }
    
    return { success: true, data: notificationData };
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
 * In a real implementation, this would use a proper email service
 */
const sendEmailNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  data: Record<string, any>
): Promise<boolean> => {
  try {
    // Get user email
    const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (error || !user) {
      console.error('Error getting user email:', error);
      return false;
    }
    
    // In a real implementation, you would use a proper email service like SendGrid, AWS SES, etc.
    // For now, we'll just log the email
    console.log(`Email would be sent to ${user.user.email}`);
    console.log(`Subject: ${title}`);
    console.log(`Message: ${message}`);
    console.log(`Type: ${type}`);
    console.log(`Data:`, data);
    
    // For development, we can use Supabase Edge Functions to send emails or 
    // configure Supabase Auth emails for password resets, etc.
    
    return true;
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
    // First, find the store associated with this therapist
    const { data: therapistData, error: therapistError } = await supabase
      .from('therapists')
      .select('store_id')
      .eq('id', therapistId)
      .single();
      
    if (therapistError || !therapistData?.store_id) {
      console.error('Error finding store for therapist:', therapistError);
      return { success: false, error: therapistError || 'No store associated with therapist' };
    }
    
    const storeId = therapistData.store_id;
    
    // Get store admins
    const { data: storeAdmins, error: storeError } = await supabase
      .from('store_admins')
      .select('user_id')
      .eq('store_id', storeId);
      
    if (storeError) {
      console.error('Error finding store admins:', storeError);
      return { success: false, error: storeError };
    }
    
    const formattedDate = bookingDateTime.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Send notification to each store admin
    const notificationPromises = storeAdmins.map(admin => 
      sendNotification({
        userId: admin.user_id,
        title: '新しい予約リクエスト',
        message: `${userName}さんから${formattedDate}の予約リクエストが届きました`,
        type: 'booking',
        data: { 
          userName, 
          therapistId,
          bookingDate: bookingDateTime.toISOString(),
          status: 'pending'
        }
      })
    );
    
    const results = await Promise.all(notificationPromises);
    return { success: true, data: results };
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