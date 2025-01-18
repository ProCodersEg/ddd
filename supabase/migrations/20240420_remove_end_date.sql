-- Remove end_date column from ads table
ALTER TABLE public.ads DROP COLUMN IF EXISTS end_date;