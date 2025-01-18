-- Add campaign metrics columns
ALTER TABLE public.ads
ADD COLUMN IF NOT EXISTS max_clicks integer,
ADD COLUMN IF NOT EXISTS max_impressions integer;

-- Set default values for existing rows
UPDATE public.ads
SET 
  max_clicks = 1000,
  max_impressions = 10000
WHERE max_clicks IS NULL;