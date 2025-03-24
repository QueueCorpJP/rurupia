
import { supabase } from '@/integrations/supabase/client';

// This function will be used to ensure the 'blog' bucket exists
export async function ensureBlogStorageBucket() {
  // First check if the bucket already exists
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('Error checking storage buckets:', bucketsError);
    return;
  }
  
  // Check if the blog bucket exists
  const blogBucketExists = buckets?.some(bucket => bucket.name === 'blog');
  
  if (!blogBucketExists) {
    // Create the blog bucket if it doesn't exist
    const { error: createError } = await supabase.storage.createBucket('blog', {
      public: true, // Make the bucket public so images can be viewed without authentication
      fileSizeLimit: 5242880, // 5MB file size limit
    });
    
    if (createError) {
      console.error('Error creating blog storage bucket:', createError);
    } else {
      console.log('Blog storage bucket created successfully');
      
      // Set up public access policies using SQL through Edge Functions or manually
      // Note: createPolicy method was removed, so we'll handle this differently
      console.log('Note: Please set up bucket policies manually in the Supabase dashboard');
    }
  }
}

// This function will be called when the app initializes
export function initializeStorage() {
  // Ensure the blog bucket exists when the app loads
  ensureBlogStorageBucket().catch(err => {
    console.error('Failed to initialize storage:', err);
  });
}
