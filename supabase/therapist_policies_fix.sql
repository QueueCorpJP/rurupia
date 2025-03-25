-- Fix for infinite recursion in profiles policies

-- Drop the problematic policy if it exists
DROP POLICY IF EXISTS "Stores can update therapist profiles they invited" ON public.profiles;

-- Create better scoped policy for stores updating therapist profiles they invited
CREATE POLICY "Stores can update invited therapist profiles"
ON public.profiles
FOR UPDATE
USING (
  invited_by_store_id = auth.uid() AND user_type = 'therapist'
)
WITH CHECK (
  invited_by_store_id = auth.uid() AND user_type = 'therapist'
);

-- Ensure therapists can update their own profiles
CREATE POLICY IF NOT EXISTS "Therapists can update their own profile"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id AND user_type = 'therapist'
)
WITH CHECK (
  auth.uid() = id AND user_type = 'therapist'
);

-- Ensure therapists can select their own profiles
CREATE POLICY IF NOT EXISTS "Therapists can view their own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id AND user_type = 'therapist'
);

-- Verify therapist access to their own table and add any missing policies
-- Check if the therapists table has RLS enabled
-- Enable Row Level Security on therapists table if not already enabled
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;

-- Check and recreate policy to allow therapists to select from therapists table
DROP POLICY IF EXISTS "Therapists can view their own record" ON public.therapists;
CREATE POLICY "Therapists can view their own record"
ON public.therapists
FOR SELECT
USING (auth.uid() = id);

-- Check and recreate policy for therapists to insert records
DROP POLICY IF EXISTS "Therapists can insert their own record" ON public.therapists;
CREATE POLICY "Therapists can insert their own record"
ON public.therapists
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Check and recreate policy for therapists to update their records
DROP POLICY IF EXISTS "Therapists can update their own record" ON public.therapists;
CREATE POLICY "Therapists can update their own record"
ON public.therapists
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Add one-time fix for any therapists who need to be fixed
-- Update the status for any therapists who are in store_therapists but not in therapists table
INSERT INTO therapists (id, name, description, location, price, specialties, experience, rating, reviews, availability)
SELECT 
  p.id, 
  p.name, 
  'セラピストの紹介文はまだありません', 
  '東京', 
  5000, 
  ARRAY[]::text[], 
  0, 
  0, 
  0, 
  ARRAY[]::text[]
FROM profiles p
JOIN store_therapists st ON p.id = st.therapist_id
LEFT JOIN therapists t ON p.id = t.id
WHERE p.user_type = 'therapist'
AND t.id IS NULL;

-- Update existing profiles for consistency
UPDATE profiles
SET status = 'active'
WHERE user_type = 'therapist'
AND status = 'pending_therapist_approval'
AND EXISTS (
  SELECT 1 FROM store_therapists st
  WHERE st.therapist_id = profiles.id
  AND st.status = 'active'
); 