import { supabase } from './client';

/**
 * Helper function to perform admin Supabase operations for blog
 */
export const createBlogPost = async (postData: any) => {
  try {
    // Get admin userId from localStorage
    const adminUserId = localStorage.getItem('admin_user_id');
    const isAdmin = localStorage.getItem('admin_session') === 'true';
    
    if (!adminUserId || !isAdmin) {
      return { data: null, error: { message: 'Not authenticated as admin' } };
    }
    
    // Use custom headers for this request
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(postData, { 
        headers: {
          'x-admin-auth': 'true',
          'x-admin-user-id': adminUserId
        } 
      });
      
    return { data, error };
  } catch (error) {
    console.error('Error creating blog post via admin helper:', error);
    return { data: null, error };
  }
};

/**
 * Helper function to upload blog images
 */
export const uploadBlogImage = async (filePath: string, file: File) => {
  try {
    // Get admin userId from localStorage
    const adminUserId = localStorage.getItem('admin_user_id');
    const isAdmin = localStorage.getItem('admin_session') === 'true';
    
    if (!adminUserId || !isAdmin) {
      return { data: null, error: { message: 'Not authenticated as admin' } };
    }
    
    // Use custom headers for this request
    const { data, error } = await supabase.storage
      .from('blog')
      .upload(filePath, file, {
        upsert: true,
        duplex: 'half',
        headers: {
          'x-admin-auth': 'true',
          'x-admin-user-id': adminUserId
        }
      });
      
    return { data, error };
  } catch (error) {
    console.error('Error uploading blog image via admin helper:', error);
    return { data: null, error };
  }
}; 