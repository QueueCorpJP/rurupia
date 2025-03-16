
-- Create storage buckets for profile avatars and verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'User profile images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('verification', 'User verification documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up access policies for the profiles bucket
CREATE POLICY "Public profiles are viewable by everyone."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload their own profile images."
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile images."
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile images."
  ON storage.objects FOR DELETE
  USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Set up access policies for the verification bucket
CREATE POLICY "Verification documents are viewable by the owner."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'verification' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own verification documents."
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'verification' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own verification documents."
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'verification' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own verification documents."
  ON storage.objects FOR DELETE
  USING (bucket_id = 'verification' AND auth.uid()::text = (storage.foldername(name))[1]);
