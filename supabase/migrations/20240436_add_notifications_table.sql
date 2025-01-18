create table notifications (
  id uuid default uuid_generate_v4() primary key,
  ad_id uuid references ads(id),
  ad_title text not null,
  ad_image text not null,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add RLS policies
alter table notifications enable row level security;

create policy "Enable read access for authenticated users" on notifications
  for select using (auth.role() = 'authenticated');

create policy "Enable update access for authenticated users" on notifications
  for update using (auth.role() = 'authenticated');