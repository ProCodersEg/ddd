-- Create a function to safely increment ad clicks
create or replace function increment_ad_clicks(ad_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update ads
  set clicks = clicks + 1
  where id = ad_id;
end;
$$;

-- Grant execute permission to anonymous users
grant execute on function increment_ad_clicks to anon;