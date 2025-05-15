-- Fix the function resolution ambiguity by dropping both functions and creating a new one with distinct name
DROP FUNCTION IF EXISTS log_page_view(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS log_page_view(VARCHAR, VARCHAR, VARCHAR);

-- Create a new function with a more specific name
CREATE OR REPLACE FUNCTION log_page_view_text(
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

-- Add RLS policy to allow anonymous users to insert page views
DROP POLICY IF EXISTS "Allow anonymous page view inserts" ON public.page_views;

CREATE POLICY "Allow anonymous page view inserts" 
ON public.page_views FOR INSERT 
TO anon 
WITH CHECK (true); 