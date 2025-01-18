create table ad_history (
  id uuid default uuid_generate_v4() primary key,
  ad_id uuid references ads(id),
  action_type text check (action_type in ('added', 'deleted', 'updated')),
  ad_name text,
  ad_image text,
  ad_description text,
  clicks_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add RLS policies
alter table ad_history enable row level security;

create policy "Enable read access for authenticated users" on ad_history
  for select using (auth.role() = 'authenticated');

create policy "Enable insert access for authenticated users" on ad_history
  for insert with check (auth.role() = 'authenticated');