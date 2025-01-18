-- Function to increment ad clicks and check limits
CREATE OR REPLACE FUNCTION increment_ad_clicks(ad_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_clicks INTEGER;
    max_clicks INTEGER;
BEGIN
    -- Get current and max clicks
    SELECT clicks, max_clicks INTO current_clicks, max_clicks
    FROM ads WHERE id = ad_id;

    -- Increment clicks
    UPDATE ads
    SET 
        clicks = COALESCE(clicks, 0) + 1,
        -- Pause ad if max_clicks is set and reached
        status = CASE 
            WHEN max_clicks IS NOT NULL AND COALESCE(clicks, 0) + 1 >= max_clicks THEN 'paused'
            ELSE status
        END
    WHERE id = ad_id;
END;
$$;

-- Function to increment ad impressions and check limits
CREATE OR REPLACE FUNCTION increment_ad_impressions(ad_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_impressions INTEGER;
    max_impressions INTEGER;
BEGIN
    -- Get current and max impressions
    SELECT impressions, max_impressions INTO current_impressions, max_impressions
    FROM ads WHERE id = ad_id;

    -- Increment impressions
    UPDATE ads
    SET 
        impressions = COALESCE(impressions, 0) + 1,
        -- Pause ad if max_impressions is set and reached
        status = CASE 
            WHEN max_impressions IS NOT NULL AND COALESCE(impressions, 0) + 1 >= max_impressions THEN 'paused'
            ELSE status
        END
    WHERE id = ad_id;
END;
$$;

-- Grant access to the anonymous role
GRANT EXECUTE ON FUNCTION increment_ad_clicks(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_ad_impressions(UUID) TO anon;