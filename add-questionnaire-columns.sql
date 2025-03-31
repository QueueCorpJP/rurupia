-- Add MBTI type and questionnaire data columns to therapists table
ALTER TABLE public.therapists 
ADD COLUMN IF NOT EXISTS mbti_type text,
ADD COLUMN IF NOT EXISTS questionnaire_data jsonb DEFAULT '{}'::jsonb;

-- Add comment to describe the structure
COMMENT ON COLUMN public.therapists.questionnaire_data IS 
'Stores therapist answers to match with user preferences in the format:
{
  "mood": "relax|stress|heal|talk",
  "therapistType": "mature|bright|inclusive|cool",
  "treatmentType": "gentle|strong|technique",
  "therapistAge": "early20s|late20s|30plus|noPreference"
}';

-- Set up RLS policy for the new columns
DROP POLICY IF EXISTS "Therapists can update their own questionnaire data" ON public.therapists;
CREATE POLICY "Therapists can update their own questionnaire data" ON public.therapists
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid()); 