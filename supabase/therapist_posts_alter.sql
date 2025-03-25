-- Add new columns to therapist_posts table
ALTER TABLE therapist_posts 
ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public',
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP WITH TIME ZONE;

-- Update RLS policies to account for visibility
CREATE OR REPLACE POLICY "Allow viewing posts based on visibility" ON therapist_posts
FOR SELECT
USING (
  -- Public posts can be viewed by anyone
  visibility = 'public' 
  OR 
  -- Follower-only posts can be viewed by followers
  (visibility = 'followers' AND EXISTS (
    SELECT 1 FROM followed_therapists 
    WHERE followed_therapists.therapist_id = therapist_posts.therapist_id 
    AND followed_therapists.user_id = auth.uid()
  ))
  OR 
  -- Therapists can always view their own posts
  therapist_id = auth.uid()
);

-- Drop the old policy if it exists
DROP POLICY IF EXISTS "Allow all users to view therapist posts" ON therapist_posts;

-- Add comment explaining the changes
COMMENT ON TABLE therapist_posts IS 'Therapist posts with visibility control and scheduling capabilities'; 