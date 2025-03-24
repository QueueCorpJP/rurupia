-- Fix blog_posts RLS policies
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON public.blog_posts;

-- Create new policy using profiles table lookup for admin check
CREATE POLICY "Admins can manage all blog posts" ON public.blog_posts
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

-- Fix storage bucket policies for blog uploads
DROP POLICY IF EXISTS "Allow admin users to manage blog images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to delete blog images" ON storage.objects;

-- Allow public read access to blog bucket images
CREATE POLICY IF NOT EXISTS "Allow public read access to blog images" 
ON storage.objects FOR SELECT
USING (bucket_id = 'blog');

-- Allow authenticated users with admin role to upload
CREATE POLICY "Allow admin users to upload blog images" 
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

-- Allow authenticated users with admin role to update
CREATE POLICY "Allow admin users to update blog images" 
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
) 
WITH CHECK (
  bucket_id = 'blog' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

-- Allow authenticated users with admin role to delete
CREATE POLICY "Allow admin users to delete blog images" 
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

-- Fix page_views table
ALTER TABLE page_views 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Make sure we have at least one blog category for testing
INSERT INTO blog_categories (id, name)
SELECT gen_random_uuid(), 'General'
WHERE NOT EXISTS (
  SELECT 1 FROM blog_categories LIMIT 1
);

-- Make sure the current user has admin privileges
UPDATE public.profiles
SET user_type = 'admin'
WHERE id = (SELECT auth.uid());

-- Verify current user has admin rights
SELECT id, user_type FROM profiles WHERE id = (SELECT auth.uid()); 