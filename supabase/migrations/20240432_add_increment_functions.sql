-- Function to increment ad clicks
CREATE OR REPLACE FUNCTION increment_ad_clicks(ad_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ads
  SET clicks = COALESCE(clicks, 0) + 1
  WHERE id = ad_id;
END;
$$;

-- Function to increment ad impressions
CREATE OR REPLACE FUNCTION increment_ad_impressions(ad_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ads
  SET impressions = COALESCE(impressions, 0) + 1
  WHERE id = ad_id;
END;
$$;

-- Grant access to the anonymous role
GRANT EXECUTE ON FUNCTION increment_ad_clicks(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_ad_impressions(UUID) TO anon;