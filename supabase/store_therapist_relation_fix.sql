-- Fix RLS policies for store_therapists table to allow therapists to create their own relationships

-- Enable RLS on store_therapists table if not already enabled
ALTER TABLE public.store_therapists ENABLE ROW LEVEL SECURITY;

-- Create policy to allow therapists to insert records for themselves
CREATE POLICY IF NOT EXISTS "Therapists can insert their own store relationships"
ON public.store_therapists
FOR INSERT
WITH CHECK (
  auth.uid() = therapist_id AND
  status = 'pending'
);

-- Create policy to allow stores to insert records for their therapists
CREATE POLICY IF NOT EXISTS "Stores can insert therapist relationships"
ON public.store_therapists
FOR INSERT 
WITH CHECK (
  auth.uid() = store_id
);

-- Create policy to allow therapists to view their own relationships
CREATE POLICY IF NOT EXISTS "Therapists can view their own store relationships"
ON public.store_therapists
FOR SELECT
USING (
  auth.uid() = therapist_id
);

-- Create policy to allow stores to view their therapist relationships
CREATE POLICY IF NOT EXISTS "Stores can view their therapist relationships"
ON public.store_therapists
FOR SELECT
USING (
  auth.uid() = store_id
);

-- Create policy to allow stores to update therapist relationships
CREATE POLICY IF NOT EXISTS "Stores can update therapist relationships"
ON public.store_therapists
FOR UPDATE
USING (
  auth.uid() = store_id
)
WITH CHECK (
  auth.uid() = store_id
);

-- Create policy to allow therapists to update their own relationships
CREATE POLICY IF NOT EXISTS "Therapists can update their own store relationships"
ON public.store_therapists
FOR UPDATE
USING (
  auth.uid() = therapist_id
)
WITH CHECK (
  auth.uid() = therapist_id
); 