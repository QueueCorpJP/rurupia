-- Check if blog_posts table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT,
    author_name TEXT DEFAULT '管理者',
    author_avatar TEXT,
    category TEXT,
    category_id UUID REFERENCES blog_categories(id),
    tags TEXT[] DEFAULT '{}',
    published_at TIMESTAMP WITH TIME ZONE,
    read_time INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT false,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blog_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert a default category if none exists
INSERT INTO blog_categories (name, description)
SELECT 'General', 'General blog posts'
WHERE NOT EXISTS (SELECT 1 FROM blog_categories LIMIT 1);

-- Drop and recreate RLS policies for blog_posts
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;

-- Allow authenticated users with admin role to manage blog posts
CREATE POLICY "Admins can manage all blog posts" ON public.blog_posts
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

-- Allow anyone to view published blog posts
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
FOR SELECT USING (published = true);

-- Enable RLS on blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS policies for blog_categories
DROP POLICY IF EXISTS "Admins can manage all blog categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Anyone can view blog categories" ON public.blog_categories;

-- Allow authenticated users with admin role to manage blog categories
CREATE POLICY "Admins can manage all blog categories" ON public.blog_categories
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

-- Allow anyone to view blog categories
CREATE POLICY "Anyone can view blog categories" ON public.blog_categories
FOR SELECT USING (true);

-- Enable RLS on blog_categories
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Check if blog storage bucket exists and create it if it doesn't
SELECT * FROM storage.buckets WHERE name = 'blog';

-- Create blog bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'blog', 'Blog images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'blog');

-- Drop and recreate RLS policies for storage objects
DROP POLICY IF EXISTS "Allow public read access to blog images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to delete blog images" ON storage.objects;

-- Allow public read access to blog bucket
CREATE POLICY "Allow public read access to blog images" 
ON storage.objects FOR SELECT
USING (bucket_id = 'blog');

-- Allow admin users to upload blog images
CREATE POLICY "Allow admin users to upload blog images" 
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

-- Allow admin users to update blog images
CREATE POLICY "Allow admin users to update blog images" 
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
) 
WITH CHECK (
  bucket_id = 'blog' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

-- Allow admin users to delete blog images
CREATE POLICY "Allow admin users to delete blog images" 
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

-- Sample blog post for testing
INSERT INTO blog_posts (
  title, 
  slug, 
  excerpt, 
  content, 
  category, 
  category_id, 
  author_name, 
  published, 
  tags
)
SELECT 
  'Welcome to Our Blog', 
  'welcome-to-our-blog-' || extract(epoch from now())::text, 
  'This is the first blog post on our platform.', 
  '<p>Welcome to our blog! This is a sample blog post created to test the blog functionality.</p><p>We hope you enjoy reading our content.</p>', 
  (SELECT name FROM blog_categories LIMIT 1), 
  (SELECT id FROM blog_categories LIMIT 1), 
  'Admin', 
  true, 
  ARRAY['welcome', 'first post']
WHERE NOT EXISTS (SELECT 1 FROM blog_posts LIMIT 1);

-- Create admin user if it doesn't exist (using Supabase Auth API)
-- Note: This is just a placeholder, actual user creation happens through the Auth API
-- Update an existing user to have admin privileges
UPDATE profiles
SET user_type = 'admin'
WHERE email = 'admin@serenitysage.com';

-- Verify everything is set up correctly
SELECT 'Blog setup complete. Verify the following:' as message;
SELECT 'Blog categories:' as check, count(*) as count FROM blog_categories;
SELECT 'Blog posts:' as check, count(*) as count FROM blog_posts;
SELECT 'Blog bucket:' as check, count(*) as count FROM storage.buckets WHERE name = 'blog';
SELECT 'Admin users:' as check, count(*) as count FROM profiles WHERE user_type = 'admin'; 