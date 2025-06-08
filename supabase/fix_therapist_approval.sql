-- Fix therapist approval issues
-- This script addresses potential problems in the therapist approval workflow

-- 1. Ensure store_therapists table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.store_therapists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, therapist_id)
);

-- 2. Enable RLS on store_therapists table
ALTER TABLE public.store_therapists ENABLE ROW LEVEL SECURITY;

-- 3. Drop any conflicting policies and create fresh ones
DROP POLICY IF EXISTS "Store owners can manage their therapist relationships" ON public.store_therapists;
DROP POLICY IF EXISTS "Therapists can view their store relationships" ON public.store_therapists;
DROP POLICY IF EXISTS "Stores can view their therapist relationships" ON public.store_therapists;
DROP POLICY IF EXISTS "Stores can update therapist relationships" ON public.store_therapists;

-- 4. Create comprehensive RLS policies
CREATE POLICY "Store owners can manage their therapist relationships"
ON public.store_therapists
FOR ALL
USING (auth.uid() = store_id)
WITH CHECK (auth.uid() = store_id);

CREATE POLICY "Therapists can view their store relationships"
ON public.store_therapists
FOR SELECT
USING (auth.uid() = therapist_id);

-- 5. Ensure profiles table has proper columns and RLS
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS invited_by_store_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 6. Create/update profile policies for store management
DROP POLICY IF EXISTS "Stores can update invited therapist profiles" ON public.profiles;
CREATE POLICY "Stores can update invited therapist profiles"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = invited_by_store_id AND 
  user_type = 'therapist' AND
  status IN ('pending_therapist_approval', 'active', 'rejected')
)
WITH CHECK (
  auth.uid() = invited_by_store_id AND 
  user_type = 'therapist'
);

-- 7. Ensure therapists table has proper RLS
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Stores can insert therapist records for approved therapists" ON public.therapists;
CREATE POLICY "Stores can insert therapist records for approved therapists"
ON public.therapists
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.store_therapists st
    WHERE st.therapist_id = id 
    AND st.store_id = auth.uid() 
    AND st.status = 'active'
  )
);

DROP POLICY IF EXISTS "Anyone can view therapist records" ON public.therapists;
CREATE POLICY "Anyone can view therapist records"
ON public.therapists
FOR SELECT
USING (true);

-- 8. Clean up any inconsistent data
-- Update any therapists with store relationships but no therapist record
INSERT INTO public.therapists (id, name, description, location, price, specialties, experience, rating, reviews, availability)
SELECT DISTINCT
  p.id,
  COALESCE(p.name, 'セラピスト'),
  'セラピストの紹介文はまだありません',
  '東京',
  5000,
  ARRAY[]::text[],
  0,
  0,
  0,
  ARRAY[]::text[]
FROM public.profiles p
JOIN public.store_therapists st ON p.id = st.therapist_id
LEFT JOIN public.therapists t ON p.id = t.id
WHERE p.user_type = 'therapist'
  AND st.status = 'active'
  AND t.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 9. Fix any profiles that should be active but aren't
UPDATE public.profiles
SET status = 'active'
WHERE user_type = 'therapist'
  AND status = 'pending_therapist_approval'
  AND EXISTS (
    SELECT 1 FROM public.store_therapists st
    WHERE st.therapist_id = profiles.id
    AND st.status = 'active'
  ); 