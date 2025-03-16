
-- Create a storage bucket for verification documents if it doesn't exist
insert into storage.buckets (id, name, public)
values ('verification', 'verification', true)
on conflict (id) do nothing;

-- Create a policy to allow authenticated users to upload files to this bucket
create policy "Allow authenticated uploads to verification bucket"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'verification');

-- Create a policy to allow authenticated users to read their own verification documents
create policy "Allow authenticated users to read verification documents"
on storage.objects
for select
to authenticated
using (bucket_id = 'verification' and (storage.foldername(name))[1] = auth.uid()::text);
