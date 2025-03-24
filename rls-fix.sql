-- This policy allows anyone to create blog posts (for testing only)
-- In production, you would want more restrictive policies

-- Create blog bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'blog', 'Blog Images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'blog');

-- Drop existing policies on blog_posts
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can create blog posts" ON public.blog_posts;

-- Create a policy that allows anyone to create blog posts (for testing)
CREATE POLICY "Anyone can create blog posts" ON public.blog_posts
FOR ALL USING (true);

-- Ensure blog_posts table exists
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    slug TEXT,
    cover_image TEXT,
    author_name TEXT,
    category TEXT,
    category_id UUID,
    tags TEXT[],
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure RLS is enabled
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop storage policies
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow anyone to upload to blog bucket" ON storage.objects;

-- Create storage policies that bypass RLS checks
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'blog');

CREATE POLICY "Allow anyone to upload to blog bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'blog');

CREATE POLICY "Allow anyone to update blog bucket objects" ON storage.objects
FOR UPDATE USING (bucket_id = 'blog') WITH CHECK (bucket_id = 'blog');

CREATE POLICY "Allow anyone to delete from blog bucket" ON storage.objects
FOR DELETE USING (bucket_id = 'blog');

-- Make sure blog_categories table exists
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add a default category if none exists
INSERT INTO public.blog_categories (name, description)
SELECT 'General', 'General blog posts'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_categories LIMIT 1); 