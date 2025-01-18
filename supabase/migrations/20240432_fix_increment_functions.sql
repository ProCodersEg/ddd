-- Drop existing functions if they exist
drop function if exists increment_ad_clicks(ad_id uuid);
drop function if exists increment_ad_impressions(ad_id uuid);

-- Create a generic increment function
create or replace function increment(value integer, column text)
returns integer as $$
begin
  return value + 1;
end;
$$ language plpgsql;

-- Create the increment_ad_clicks function
create or replace function increment_ad_clicks(ad_id uuid)
returns void as $$
begin
  update ads
  set clicks = clicks + 1
  where id = ad_id;
end;
$$ language plpgsql security definer;

-- Create the increment_ad_impressions function
create or replace function increment_ad_impressions(ad_id uuid)
returns void as $$
begin
  update ads
  set impressions = impressions + 1
  where id = ad_id;
end;
$$ language plpgsql security definer;

-- Grant execute permissions to anon role
grant execute on function increment_ad_clicks(uuid) to anon;
grant execute on function increment_ad_impressions(uuid) to anon;
grant execute on function increment(integer, text) to anon;