-- Enable Row Level Security on therapists table if not already enabled
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;

-- Create policy to allow therapists to insert themselves
CREATE POLICY "Therapists can insert their own record" 
ON public.therapists
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create policy to allow therapists to update their own record
CREATE POLICY "Therapists can update their own record"
ON public.therapists
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create policy to allow therapists to read their own record
CREATE POLICY "Therapists can view their own record"
ON public.therapists
FOR SELECT
USING (auth.uid() = id);

-- Create policy to allow anyone to read therapist records (for public viewing)
CREATE POLICY "Anyone can view therapist records"
ON public.therapists
FOR SELECT
USING (true);

-- Create policy to allow stores to view therapists they have relationships with
CREATE POLICY "Stores can view related therapists"
ON public.therapists
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.store_therapists st
    WHERE st.therapist_id = id AND st.store_id = auth.uid()
  )
);

-- Create policy to allow stores to update therapists they have relationships with
CREATE POLICY "Stores can update their therapists' records"
ON public.therapists
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.store_therapists st
    WHERE st.therapist_id = id AND st.store_id = auth.uid() AND st.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.store_therapists st
    WHERE st.therapist_id = id AND st.store_id = auth.uid() AND st.status = 'active'
  )
); 