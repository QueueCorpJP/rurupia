-- Drop existing function if it exists (to avoid conflicts)
DROP FUNCTION IF EXISTS log_page_view(TEXT, TEXT, TEXT);

-- Create or replace the log_page_view function with renamed parameters for clarity
CREATE OR REPLACE FUNCTION log_page_view(
  page_path TEXT,
  ip TEXT,
  user_agent TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO page_views (
    page,
    ip_address,
    user_agent,
    view_date
  ) VALUES (
    page_path,
    ip,
    user_agent,
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing function if it exists (to avoid conflicts)
DROP FUNCTION IF EXISTS increment_blog_view(TEXT);

-- Create a function to increment blog post views
CREATE OR REPLACE FUNCTION increment_blog_view(slug_param TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE blog_posts
  SET views = COALESCE(views, 0) + 1
  WHERE slug = slug_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the page_views table has a created_at column
ALTER TABLE page_views 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(); 