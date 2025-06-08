import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/admin-client';

/**
 * Get a public URL for a file in Supabase storage
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @param useAdmin Whether to use the admin client (bypassing RLS)
 * @returns The public URL for the file
 */
export const getStorageUrl = async (bucket: string, path: string, useAdmin = false) => {
  if (!path) return null;
  
  if (useAdmin) {
    // Admin client getPublicUrl returns a promise
    const { data } = await supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } else {
    // Regular client getPublicUrl is synchronous
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
};

/**
 * Get a public URL for a verification document
 * @param documentPath The document path as stored in profiles.verification_document
 * @param useAdmin Whether to use the admin client (bypassing RLS)
 * @returns The public URL for the verification document
 */
export const getVerificationDocumentUrl = async (documentPath: string, useAdmin = true) => {
  if (!documentPath) return null;
  return await getStorageUrl('verification', documentPath, useAdmin);
};

/**
 * Send verification email to user using the edge function
 * @param userEmail User's email address
 * @param userName User's name
 * @param isApproved Whether the verification was approved or rejected
 * @param userId Optional user ID - if provided, will be used instead of looking up by email
 */
export const sendVerificationEmail = async (userEmail: string, userName: string, isApproved: boolean, userId?: string) => {
  try {
    const subject = isApproved ? 'アカウント認証完了のお知らせ' : 'アカウント認証について';
    const message = isApproved 
      ? `${userName}様\n\nお疲れ様です。るぴぴあ運営チームです。\n\nあなたのアカウントの本人確認が完了いたしました。\nこれでプラットフォーム内のすべての機能をご利用いただけます。\n\n・セラピストとのメッセージ機能\n・予約機能\n・コメント・いいね機能\n\n引き続きるぴぴあをお楽しみください。\n\nるぴぴあ運営チーム`
      : `${userName}様\n\nお疲れ様です。るぴぴあ運営チームです。\n\n申し訳ございませんが、提出いただいた本人確認書類に不備があったため、認証を完了することができませんでした。\n\nお手数ですが、再度正しい本人確認書類をアップロードしてください。\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\nるぴぴあ運営チーム`;

    // Log email details for debugging
    console.log('=== VERIFICATION EMAIL NOTIFICATION ===');
    console.log('To:', userEmail);
    console.log('Subject:', subject);
    console.log('Status:', isApproved ? 'APPROVED' : 'REJECTED');
    console.log('Message:', message);
    console.log('=== END EMAIL NOTIFICATION ===');

    // Call the edge function to send the actual email using admin client
    const { data, error } = await supabaseAdmin.functions.invoke('send-email-notification', {
      body: {
        userId: userId || null,
        title: subject,
        message: message,
        type: 'verification',
        data: {
          isApproved: isApproved,
          userName: userName,
          userEmail: userEmail // Include email in data for edge function to use
        }
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }
    console.log('✅ Edge function response:', data);
    
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Don't throw error - email is optional and we don't want to break the verification process
  }
};

/**
 * Update a user's verification status
 * @param userId The user ID
 * @param isVerified Whether the user is verified
 * @param status Optional new status (e.g. 'active', 'rejected')
 * @returns Success status
 */
export const updateVerificationStatus = async (
  userId: string,
  isVerified: boolean,
  status?: string
) => {
  try {
    console.log('Updating verification status for user:', userId, { isVerified, status });
    
    console.log('=== VERIFICATION STATUS UPDATE ===');
    console.log('User ID:', userId);
    console.log('Is Verified:', isVerified);
    console.log('New Status:', status);
    console.log('=== END STATUS UPDATE ===');

    // Update the user's profile in the database
    const updateData: any = {
      is_verified: isVerified,
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
    }

    // Update the user's profile in the database using admin client
    const result = await new Promise((resolve, reject) => {
      supabaseAdmin.from('profiles').update(updateData).eq('user_id', userId).then(resolve, reject);
    }) as any;

    if (result.error) {
      console.error('Database update error:', result.error);
      throw result.error;
    }

    console.log('✅ Database update completed successfully:', result.data);
    console.log('✅ Verification status updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error updating verification status:', error);
    return { success: false, error };
  }
}; 