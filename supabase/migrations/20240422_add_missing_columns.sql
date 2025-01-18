-- Add missing columns to the ads table
ALTER TABLE public.ads
ADD COLUMN IF NOT EXISTS target_audience text,
ADD COLUMN IF NOT EXISTS budget decimal(10,2),
ADD COLUMN IF NOT EXISTS frequency_cap integer;

-- Set default values for existing rows
UPDATE public.ads
SET 
  target_audience = 'All',
  budget = 100.00,
  frequency_cap = 3
WHERE target_audience IS NULL;