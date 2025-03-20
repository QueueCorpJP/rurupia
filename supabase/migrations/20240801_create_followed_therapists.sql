
-- Create table to track which therapists users are following
CREATE TABLE IF NOT EXISTS public.followed_therapists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, therapist_id)
);

-- Enable Row Level Security
ALTER TABLE public.followed_therapists ENABLE ROW LEVEL SECURITY;

-- Create policies for followed_therapists
CREATE POLICY "Users can view their own followed therapists"
  ON public.followed_therapists
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add therapists they follow"
  ON public.followed_therapists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove therapists they follow"
  ON public.followed_therapists
  FOR DELETE
  USING (auth.uid() = user_id);
