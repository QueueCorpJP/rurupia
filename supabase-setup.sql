-- Blog storage bucket setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog', 'Blog images', true);

-- Storage bucket policies
CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'blog');

CREATE POLICY "Allow admin users to upload blog images" ON storage.objects 
FOR INSERT TO authenticated USING (
  bucket_id = 'blog' AND 
  (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'))
);

CREATE POLICY "Allow admin users to update their blog images" ON storage.objects 
FOR UPDATE TO authenticated USING (
  bucket_id = 'blog' AND 
  (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'))
) WITH CHECK (
  bucket_id = 'blog' AND 
  (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'))
);

CREATE POLICY "Allow admin users to delete their blog images" ON storage.objects 
FOR DELETE TO authenticated USING (
  bucket_id = 'blog' AND 
  (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin'))
);

-- Fix blog_posts policies
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON public.blog_posts;
CREATE POLICY "Admins can manage all blog posts" ON public.blog_posts
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

-- Create RLS policy for page_views table
CREATE POLICY IF NOT EXISTS "Allow admin users to view page_views" ON public.page_views
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

CREATE POLICY IF NOT EXISTS "Allow insert to page_views" ON public.page_views
FOR INSERT TO authenticated
WITH CHECK (true); 