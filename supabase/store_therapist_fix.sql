-- Create policy to allow stores to update therapist profiles they invited
CREATE POLICY IF NOT EXISTS "Stores can update therapist profiles they invited"
ON public.profiles
FOR UPDATE
USING (
  invited_by_store_id = auth.uid()
)
WITH CHECK (
  invited_by_store_id = auth.uid()
);

-- One-time update to fix existing profiles
UPDATE profiles
SET status = 'active'
WHERE status = 'pending_therapist_approval'
AND EXISTS (
  SELECT 1 FROM store_therapists st
  WHERE st.therapist_id = profiles.id
  AND st.status = 'active'
); 