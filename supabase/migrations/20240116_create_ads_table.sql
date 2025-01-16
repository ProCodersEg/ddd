create table public.ads (
  id uuid default gen_random_uuid() primary key,
  type text check (type in ('banner', 'interstitial')) not null,
  title text,
  description text,
  image_url text not null,
  redirect_url text not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  status text check (status in ('active', 'paused')) not null default 'active',
  created_at timestamp with time zone default now() not null,
  clicks integer default 0 not null,
  impressions integer default 0 not null
);

-- Add RLS policies
alter table public.ads enable row level security;

-- Allow anonymous read access
create policy "Allow anonymous read access"
  on public.ads
  for select
  to anon
  using (true);

-- Insert some sample data
insert into public.ads (
  type,
  title,
  description,
  image_url,
  redirect_url,
  start_date,
  end_date,
  status,
  clicks,
  impressions
) values 
(
  'banner',
  'Summer Sale',
  'Get 50% off on all items',
  'https://example.com/banner1.jpg',
  'https://example.com/sale',
  now(),
  now() + interval '30 days',
  'active',
  100,
  1000
),
(
  'banner',
  'Winter Collection',
  'New arrivals',
  'https://example.com/banner2.jpg',
  'https://example.com/winter',
  now(),
  now() + interval '30 days',
  'paused',
  50,
  500
),
(
  'interstitial',
  'Special Offer',
  'Limited time deal',
  'https://example.com/interstitial1.jpg',
  'https://example.com/special',
  now(),
  now() + interval '30 days',
  'active',
  200,
  2000
),
(
  'interstitial',
  'Holiday Sale',
  'Exclusive deals',
  'https://example.com/interstitial2.jpg',
  'https://example.com/holiday',
  now(),
  now() + interval '30 days',
  'paused',
  75,
  750
);