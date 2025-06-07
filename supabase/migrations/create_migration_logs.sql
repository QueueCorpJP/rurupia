-- Create migration logs table to track SQL migrations
CREATE TABLE IF NOT EXISTS migration_logs (
  id SERIAL PRIMARY KEY,
  migration_name TEXT UNIQUE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT
);

-- Make sure admin can access this table
CREATE POLICY "Admin access to migration logs" ON migration_logs
  FOR ALL USING (is_admin(auth.uid()));

-- Allow service role full access
GRANT ALL ON migration_logs TO service_role; 