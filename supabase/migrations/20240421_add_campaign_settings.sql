-- Add new columns for campaign settings that were missing
ALTER TABLE public.ads
ADD COLUMN IF NOT EXISTS budget decimal(10,2),
ADD COLUMN IF NOT EXISTS target_audience text,
ADD COLUMN IF NOT EXISTS frequency_cap integer;

-- Set default values for existing rows
UPDATE public.ads
SET 
  budget = 100.00,
  target_audience = 'All',
  frequency_cap = 3
WHERE budget IS NULL;