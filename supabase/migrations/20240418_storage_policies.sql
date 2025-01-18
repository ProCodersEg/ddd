-- Enable RLS
alter table storage.objects enable row level security;

-- Create policy to allow authenticated uploads to ad-images bucket
create policy "Allow authenticated uploads"
on storage.objects for insert
with check (
  bucket_id = 'ad-images'
  AND auth.role() = 'authenticated'
);

-- Create policy to allow authenticated users to update their uploads
create policy "Allow authenticated updates"
on storage.objects for update
using (
  bucket_id = 'ad-images'
  AND auth.role() = 'authenticated'
);

-- Create policy to allow public read access to ad images
create policy "Public read access"
on storage.objects for select
using ( bucket_id = 'ad-images' );

-- Ensure the bucket exists and is public
insert into storage.buckets (id, name, public)
values ('ad-images', 'ad-images', true)
on conflict (id) do update set public = true;