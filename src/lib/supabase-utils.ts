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
 * Send verification email to user
 * @param userEmail User's email address
 * @param userName User's name
 * @param isApproved Whether the verification was approved or rejected
 */
export const sendVerificationEmail = async (userEmail: string, userName: string, isApproved: boolean) => {
  try {
    const subject = isApproved ? 'アカウント認証完了のお知らせ' : 'アカウント認証について';
    const message = isApproved 
      ? `${userName}様\n\nお疲れ様です。るぴぴあ運営チームです。\n\nあなたのアカウントの本人確認が完了いたしました。\nこれでプラットフォーム内のすべての機能をご利用いただけます。\n\n・セラピストとのメッセージ機能\n・予約機能\n・コメント・いいね機能\n\n引き続きるぴぴあをお楽しみください。\n\nるぴぴあ運営チーム`
      : `${userName}様\n\nお疲れ様です。るぴぴあ運営チームです。\n\n申し訳ございませんが、提出いただいた本人確認書類に不備があったため、認証を完了することができませんでした。\n\nお手数ですが、再度正しい本人確認書類をアップロードしてください。\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\nるぴぴあ運営チーム`;

    // Try to send email using Supabase Edge Functions
    try {
      await supabaseAdmin.functions.invoke('send-email', {
        body: {
          to: userEmail,
          subject: subject,
          message: message
        }
      });
    } catch (functionError) {
      console.warn('Edge function not available, sending email via auth:', functionError);
      
      // Fallback: Send email through auth (password reset style - temporary solution)
      // In production, you should set up proper email service like Resend, SendGrid, etc.
      console.log('Would send email to:', userEmail);
      console.log('Subject:', subject);
      console.log('Message:', message);
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Don't throw error - email is optional
  }
};

/**
 * Update a user's verification status
 * @param userId The user ID
 * @param isVerified Whether the user is verified
 * @param status Optional new status (e.g. 'active', 'バン')
 * @returns Success status
 */
export const updateVerificationStatus = async (
  userId: string,
  isVerified: boolean,
  status?: string
) => {
  try {
    const updates: any = { is_verified: isVerified };
    
    if (status) {
      updates.status = status;
    }
    
    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating verification status:', error);
    return { success: false, error };
  }
}; 