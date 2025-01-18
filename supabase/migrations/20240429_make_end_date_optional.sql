-- Make end_date column optional in ads table
ALTER TABLE public.ads ALTER COLUMN end_date DROP NOT NULL;

-- Set a default value for existing rows that have NULL end_date
UPDATE public.ads 
SET end_date = start_date + interval '30 days'
WHERE end_date IS NULL;