-- Fix for therapists table schema issues

-- Make the price column in therapists table nullable so NULL values are allowed
ALTER TABLE public.therapists ALTER COLUMN price DROP NOT NULL;

-- Update any existing records that might have null values as stringified 'null'
UPDATE public.therapists
SET price = NULL
WHERE price::text = 'null';

-- Make sure the table has appropriate indexes for performance
CREATE INDEX IF NOT EXISTS idx_therapists_id ON public.therapists(id);

-- Verify existing therapist records
SELECT COUNT(*) FROM public.therapists;

-- Count therapists with pending profiles to verify data consistency
SELECT COUNT(*) 
FROM public.profiles 
WHERE user_type = 'therapist' 
AND status = 'pending_therapist_approval';

-- Cross-check therapists in profiles vs therapists table
SELECT COUNT(*)
FROM public.profiles p
LEFT JOIN public.therapists t ON p.id = t.id
WHERE p.user_type = 'therapist'
AND t.id IS NULL; 