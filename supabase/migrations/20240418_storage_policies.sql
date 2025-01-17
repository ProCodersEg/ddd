-- Enable RLS
alter table storage.objects enable row level security;

-- Create policy to allow public access to ad images
create policy "Public Access"
on storage.objects for all
using ( bucket_id = 'ad-images' );

-- Ensure the bucket exists and is public
insert into storage.buckets (id, name, public)
values ('ad-images', 'ad-images', true)
on conflict (id) do update set public = true;