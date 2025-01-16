-- Add new columns for campaign settings
alter table public.ads
add column max_clicks integer,
add column max_impressions integer,
add column target_audience text,
add column budget decimal(10,2),
add column frequency_cap integer;

-- Update existing rows with default values
update public.ads
set 
  max_clicks = 1000,
  max_impressions = 10000,
  target_audience = 'All',
  budget = 100.00,
  frequency_cap = 3
where id in (select id from public.ads limit 4);