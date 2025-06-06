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
    // Admin client getPublicUrl is async
    const { data } = await supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } else {
    // Regular client getPublicUrl is sync
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