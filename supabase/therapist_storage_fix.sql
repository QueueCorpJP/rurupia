-- Fix for therapist storage and schema issues

-- ===============================================
-- PART 1: ADD MISSING COLUMN TO THERAPISTS TABLE
-- ===============================================

-- Add the missing galleryImages column to the therapists table
ALTER TABLE public.therapists 
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- ===============================================
-- PART 2: CREATE STORAGE BUCKETS
-- ===============================================

-- Create therapist storage buckets if they don't exist
-- Note: This requires admin rights, and should be run by an admin user
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('therapists', 'Therapist files', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']::text[])
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- PART 3: CREATE STORAGE POLICIES
-- ===============================================

-- Allow public read access to therapist files
CREATE POLICY IF NOT EXISTS "Allow public read access for therapist files"
ON storage.objects FOR SELECT
USING (bucket_id = 'therapists');

-- Allow therapists to upload files to their own directories
CREATE POLICY IF NOT EXISTS "Allow therapists to upload their own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'therapists' AND
  (auth.uid()::text = SPLIT_PART(name, '/', 1) OR
   EXISTS (
     SELECT 1 FROM public.therapists
     WHERE therapists.id = auth.uid()
   ))
);

-- Allow therapists to update their own files
CREATE POLICY IF NOT EXISTS "Allow therapists to update their own files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'therapists' AND
  (auth.uid()::text = SPLIT_PART(name, '/', 1) OR
   EXISTS (
     SELECT 1 FROM public.therapists
     WHERE therapists.id = auth.uid()
   ))
)
WITH CHECK (
  bucket_id = 'therapists' AND
  (auth.uid()::text = SPLIT_PART(name, '/', 1) OR
   EXISTS (
     SELECT 1 FROM public.therapists
     WHERE therapists.id = auth.uid()
   ))
);

-- Allow therapists to delete their own files
CREATE POLICY IF NOT EXISTS "Allow therapists to delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'therapists' AND
  (auth.uid()::text = SPLIT_PART(name, '/', 1) OR
   EXISTS (
     SELECT 1 FROM public.therapists
     WHERE therapists.id = auth.uid()
   ))
);

-- ===============================================
-- PART 4: UPDATE THERAPIST TABLE POLICIES
-- ===============================================

-- Update the therapist update policy to include the new gallery_images column
DROP POLICY IF EXISTS "Therapists can update their own record" ON public.therapists;
CREATE POLICY "Therapists can update their own record"
ON public.therapists
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ===============================================
-- PART 5: APPLY A ONE-TIME UPDATE FOR EXISTING DATA
-- ===============================================

-- Fix any existing records that may have tried to set galleryImages
UPDATE public.therapists
SET gallery_images = ARRAY[]::TEXT[]
WHERE gallery_images IS NULL; 