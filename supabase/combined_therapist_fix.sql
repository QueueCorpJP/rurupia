-- Combined fixes for therapist signup and profile issues
-- This script addresses:
-- 1. The therapist table price NOT NULL constraint
-- 2. Row-level security policies for therapists to create records
-- 3. Row-level security policies for store-therapist relationships
-- 4. Overall data consistency

-- ===============================================
-- PART 1: FIX THERAPISTS TABLE SCHEMA
-- ===============================================

-- Make the price column in therapists table nullable
ALTER TABLE public.therapists ALTER COLUMN price DROP NOT NULL;

-- Update any existing records with stringified 'null' values
UPDATE public.therapists
SET price = NULL
WHERE price::text = 'null';

-- ===============================================
-- PART 2: FIX THERAPIST RLS POLICIES
-- ===============================================

-- Enable Row Level Security on therapists table if not already enabled
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;

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

-- Check and recreate policy to allow therapists to select from therapists table
DROP POLICY IF EXISTS "Therapists can view their own record" ON public.therapists;
CREATE POLICY "Therapists can view their own record"
ON public.therapists
FOR SELECT
USING (auth.uid() = id);

-- Create policy to allow anyone to read therapist records for public viewing
DROP POLICY IF EXISTS "Anyone can view therapist records" ON public.therapists;
CREATE POLICY "Anyone can view therapist records"
ON public.therapists
FOR SELECT
USING (true);

-- ===============================================
-- PART 3: FIX STORE-THERAPIST RELATIONSHIP POLICIES
-- ===============================================

-- Enable RLS on store_therapists table
ALTER TABLE public.store_therapists ENABLE ROW LEVEL SECURITY;

-- Create policy to allow therapists to insert records for themselves
DROP POLICY IF EXISTS "Therapists can insert their own store relationships" ON public.store_therapists;
CREATE POLICY "Therapists can insert their own store relationships"
ON public.store_therapists
FOR INSERT
WITH CHECK (
  auth.uid() = therapist_id AND
  status = 'pending'
);

-- Create policy to allow stores to insert records for their therapists
DROP POLICY IF EXISTS "Stores can insert therapist relationships" ON public.store_therapists;
CREATE POLICY "Stores can insert therapist relationships"
ON public.store_therapists
FOR INSERT 
WITH CHECK (
  auth.uid() = store_id
);

-- Create policy to allow therapists to view their own relationships
DROP POLICY IF EXISTS "Therapists can view their own store relationships" ON public.store_therapists;
CREATE POLICY "Therapists can view their own store relationships"
ON public.store_therapists
FOR SELECT
USING (
  auth.uid() = therapist_id
);

-- Create policy to allow stores to view their therapist relationships
DROP POLICY IF EXISTS "Stores can view their therapist relationships" ON public.store_therapists;
CREATE POLICY "Stores can view their therapist relationships"
ON public.store_therapists
FOR SELECT
USING (
  auth.uid() = store_id
);

-- Create policy to allow stores to update therapist relationships
DROP POLICY IF EXISTS "Stores can update therapist relationships" ON public.store_therapists;
CREATE POLICY "Stores can update therapist relationships"
ON public.store_therapists
FOR UPDATE
USING (
  auth.uid() = store_id
)
WITH CHECK (
  auth.uid() = store_id
);

-- Create policy to allow therapists to update their own relationships
DROP POLICY IF EXISTS "Therapists can update their own store relationships" ON public.store_therapists;
CREATE POLICY "Therapists can update their own store relationships"
ON public.store_therapists
FOR UPDATE
USING (
  auth.uid() = therapist_id
)
WITH CHECK (
  auth.uid() = therapist_id
);

-- ===============================================
-- PART 4: FIX PROFILE POLICIES
-- ===============================================

-- Drop the problematic policy if it exists
DROP POLICY IF EXISTS "Stores can update therapist profiles they invited" ON public.profiles;

-- Create better scoped policy for stores updating therapist profiles they invited
DROP POLICY IF EXISTS "Stores can update invited therapist profiles" ON public.profiles;
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
DROP POLICY IF EXISTS "Therapists can update their own profile" ON public.profiles;
CREATE POLICY "Therapists can update their own profile"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id AND user_type = 'therapist'
)
WITH CHECK (
  auth.uid() = id AND user_type = 'therapist'
);

-- Ensure therapists can select their own profiles
DROP POLICY IF EXISTS "Therapists can view their own profile" ON public.profiles;
CREATE POLICY "Therapists can view their own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id AND user_type = 'therapist'
);

-- ===============================================
-- PART 5: DATA FIX FOR CONSISTENCY
-- ===============================================

-- Create any missing therapist records for users marked as therapists in profiles
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
LEFT JOIN therapists t ON p.id = t.id
WHERE p.user_type = 'therapist'
AND t.id IS NULL;

-- Fix any inconsistent status values
UPDATE profiles
SET status = 'active'
WHERE user_type = 'therapist'
AND status = 'pending_therapist_approval'
AND EXISTS (
  SELECT 1 FROM store_therapists st
  WHERE st.therapist_id = profiles.id
  AND st.status = 'active'
);

-- ===============================================
-- PART 6: VERIFY FIXES
-- ===============================================

-- Verify therapist counts
SELECT 'Total therapist profiles' as metric, COUNT(*) as count
FROM profiles 
WHERE user_type = 'therapist';

SELECT 'Therapist records in therapists table' as metric, COUNT(*) as count
FROM therapists;

SELECT 'Therapists with store relationships' as metric, COUNT(DISTINCT therapist_id) as count
FROM store_therapists;

-- Verify policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM 
    pg_policies
WHERE 
    tablename IN ('therapists', 'store_therapists', 'profiles')
ORDER BY 
    tablename, 
    policyname; 