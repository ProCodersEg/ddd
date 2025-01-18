-- Drop existing policies to avoid conflicts
drop policy if exists "Allow authenticated uploads" on storage.objects;
drop policy if exists "Allow authenticated updates" on storage.objects;
drop policy if exists "Allow authenticated deletes" on storage.objects;
drop policy if exists "Public read access" on storage.objects;

-- Create policy to allow authenticated uploads to ad-images bucket
create policy "Allow authenticated uploads"
on storage.objects for insert
with check (
  auth.role() = 'authenticated' AND
  bucket_id = 'ad-images'
);

-- Create policy to allow authenticated updates
create policy "Allow authenticated updates"
on storage.objects for update
using (
  auth.role() = 'authenticated' AND
  bucket_id = 'ad-images'
);

-- Create policy to allow authenticated deletes
create policy "Allow authenticated deletes"
on storage.objects for delete
using (
  auth.role() = 'authenticated' AND
  bucket_id = 'ad-images'
);

-- Create policy to allow public read access to ad images
create policy "Public read access"
on storage.objects for select
using ( bucket_id = 'ad-images' );

-- Ensure the bucket exists
insert into storage.buckets (id, name, public)
values ('ad-images', 'ad-images', true)
on conflict (id) do update set public = true;