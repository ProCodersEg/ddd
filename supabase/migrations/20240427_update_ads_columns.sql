-- Add missing columns to ads table if they don't exist
ALTER TABLE public.ads
ADD COLUMN IF NOT EXISTS max_clicks integer,
ADD COLUMN IF NOT EXISTS max_impressions integer,
ADD COLUMN IF NOT EXISTS target_audience text,
ADD COLUMN IF NOT EXISTS frequency_cap integer;

-- Set default values for existing rows
UPDATE public.ads
SET 
  max_clicks = 1000,
  max_impressions = 10000,
  target_audience = 'All',
  frequency_cap = 3
WHERE max_clicks IS NULL;