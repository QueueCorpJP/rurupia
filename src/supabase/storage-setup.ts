import { supabase } from '@/integrations/supabase/client';

// This function will be used to ensure the 'blog' bucket exists
export async function ensureBlogStorageBucket() {
  try {
    // First check if the user is an admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No active session, skipping bucket creation');
      return;
    }

    // Check if the bucket already exists
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
        public: true,
        fileSizeLimit: 5242880, // 5MB file size limit
      });
      
      if (createError) {
        if (createError.message.includes('row-level security')) {
          console.log('Insufficient permissions to create bucket. This is expected for non-admin users.');
        } else {
          console.error('Error creating blog storage bucket:', createError);
        }
      } else {
        console.log('Blog storage bucket created successfully');
      }
    }
  } catch (error) {
    console.error('Error in storage setup:', error);
  }
}

// This function will be called when the app initializes
export function initializeStorage() {
  // Ensure the blog bucket exists when the app loads
  ensureBlogStorageBucket().catch(err => {
    console.error('Failed to initialize storage:', err);
  });
}
