-- Admin Policies Setup
-- This migration ensures admin users have full access to all tables

-- First, create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- For profiles table - admin access
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;
CREATE POLICY "Admin full access to profiles" ON profiles
  FOR ALL USING (is_admin(auth.uid()) OR id = auth.uid());

-- For stores table - admin access  
DROP POLICY IF EXISTS "Admin full access to stores" ON stores;
CREATE POLICY "Admin full access to stores" ON stores
  FOR ALL USING (is_admin(auth.uid()) OR id = auth.uid());

-- For therapists table - admin access
DROP POLICY IF EXISTS "Admin full access to therapists" ON therapists;
CREATE POLICY "Admin full access to therapists" ON therapists
  FOR ALL USING (is_admin(auth.uid()) OR id = auth.uid());

-- For bookings table - admin access
DROP POLICY IF EXISTS "Admin full access to bookings" ON bookings;
CREATE POLICY "Admin full access to bookings" ON bookings
  FOR ALL USING (is_admin(auth.uid()) OR customer_id = auth.uid() OR therapist_id = auth.uid());

-- For messages table - admin access
DROP POLICY IF EXISTS "Admin full access to messages" ON messages;
CREATE POLICY "Admin full access to messages" ON messages
  FOR ALL USING (is_admin(auth.uid()) OR sender_id = auth.uid() OR recipient_id = auth.uid());

-- For notifications table - admin access
DROP POLICY IF EXISTS "Admin full access to notifications" ON notifications;
CREATE POLICY "Admin full access to notifications" ON notifications
  FOR ALL USING (is_admin(auth.uid()) OR user_id = auth.uid());

-- For blog_posts table - admin access
DROP POLICY IF EXISTS "Admin full access to blog_posts" ON blog_posts;
CREATE POLICY "Admin full access to blog_posts" ON blog_posts
  FOR ALL USING (is_admin(auth.uid()));

-- Allow public read access to published blog posts
DROP POLICY IF EXISTS "Public read access to published blog posts" ON blog_posts;
CREATE POLICY "Public read access to published blog posts" ON blog_posts
  FOR SELECT USING (status = 'published');

-- For analytics tables - admin access only
DROP POLICY IF EXISTS "Admin only access to page_views" ON page_views;
CREATE POLICY "Admin only access to page_views" ON page_views
  FOR ALL USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin only access to analytics_metrics" ON analytics_metrics;
CREATE POLICY "Admin only access to analytics_metrics" ON analytics_metrics
  FOR ALL USING (is_admin(auth.uid()));

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Make sure admin users can access everything
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Create an index on user_type for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);

-- Log that admin policies have been set up
INSERT INTO migration_logs (migration_name, executed_at) 
VALUES ('admin_policies_setup', NOW())
ON CONFLICT (migration_name) 
DO UPDATE SET executed_at = NOW(); 