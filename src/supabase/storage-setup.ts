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

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error checking user permissions:', profileError);
      return;
    }

    if (profile?.user_type !== 'admin') {
      console.log('User is not an admin, skipping bucket creation');
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
          console.log('RLS policy preventing bucket creation. Please create the bucket manually in the Supabase dashboard with this SQL:');
          console.log(`
          -- Run this in the Supabase SQL editor:
          INSERT INTO storage.buckets (id, name, public)
          VALUES ('blog', 'Blog images', true);
          
          -- Then add these policies for the bucket:
          CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'blog');
          CREATE POLICY "Allow admin users to upload blog images" ON storage.objects 
          FOR INSERT TO authenticated USING (
            bucket_id = 'blog' AND 
            (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'))
          );
          CREATE POLICY "Allow admin users to update their blog images" ON storage.objects 
          FOR UPDATE TO authenticated USING (
            bucket_id = 'blog' AND 
            (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'))
          ) WITH CHECK (
            bucket_id = 'blog' AND 
            (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'))
          );
          CREATE POLICY "Allow admin users to delete their blog images" ON storage.objects 
          FOR DELETE TO authenticated USING (
            bucket_id = 'blog' AND 
            (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'))
          );
          `);
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
