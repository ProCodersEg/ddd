-- Enable RLS
alter table storage.objects enable row level security;

-- Create policy to allow anonymous uploads to ad-images bucket
create policy "Allow anonymous uploads"
on storage.objects for insert
with check (
  bucket_id = 'ad-images'
  AND auth.role() = 'anon'
);

-- Create policy to allow public read access to ad images
create policy "Public read access"
on storage.objects for select
using ( bucket_id = 'ad-images' );

-- Ensure the bucket exists and is public
insert into storage.buckets (id, name, public)
values ('ad-images', 'ad-images', true)
on conflict (id) do update set public = true;