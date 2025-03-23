-- Add line_id column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS line_id TEXT;

-- Create an index for faster lookups by line_id
CREATE INDEX IF NOT EXISTS profiles_line_id_idx ON public.profiles (line_id);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.line_id IS 'LINE User ID for LINE login integration';

-- Update RLS policies to allow access to this column
ALTER POLICY "Users can view their own profile" ON "public"."profiles" 
  USING (auth.uid() = id);

ALTER POLICY "Users can update their own profile" ON "public"."profiles" 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id); 