-- Function to increment ad clicks
create or replace function increment_ad_clicks(ad_id uuid)
returns void as $$
begin
  update ads
  set clicks = clicks + 1
  where id = ad_id;
end;
$$ language plpgsql security definer;

-- Function to increment ad impressions
create or replace function increment_ad_impressions(ad_id uuid)
returns void as $$
begin
  update ads
  set impressions = impressions + 1
  where id = ad_id;
end;
$$ language plpgsql security definer;