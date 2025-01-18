-- Remove impression-related columns
ALTER TABLE public.ads
DROP COLUMN IF EXISTS impressions,
DROP COLUMN IF EXISTS max_impressions;

-- Update increment_ad_clicks function to be simpler
CREATE OR REPLACE FUNCTION increment_ad_clicks(ad_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE ads
    SET 
        clicks = COALESCE(clicks, 0) + 1,
        status = CASE 
            WHEN max_clicks IS NOT NULL AND COALESCE(clicks, 0) + 1 >= max_clicks THEN 'paused'
            ELSE status
        END
    WHERE id = ad_id;
END;
$$;