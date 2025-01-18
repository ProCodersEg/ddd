create type ad_action as enum ('added', 'updated');

create table public.ad_history (
    id uuid default gen_random_uuid() primary key,
    ad_id uuid references public.ads(id) on delete cascade,
    action_type ad_action not null,
    ad_name text,
    ad_image text,
    ad_description text,
    clicks_count integer,
    created_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.ad_history enable row level security;

create policy "Allow anonymous read access"
  on public.ad_history
  for select
  to anon
  using (true);