
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
      
      // Set up a policy to allow authenticated users to upload
      const { error: policyError } = await supabase.storage.from('blog').createPolicy(
        'authenticated-can-upload',
        {
          name: 'authenticated-can-upload',
          definition: {
            in: ['INSERT'],
            roleName: 'authenticated',
            predicate: 'true'
          }
        }
      );
      
      if (policyError) {
        console.error('Error creating upload policy:', policyError);
      }
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
