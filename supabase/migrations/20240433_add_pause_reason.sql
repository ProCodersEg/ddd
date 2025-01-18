-- Add pause_reason column to ads table
ALTER TABLE public.ads
ADD COLUMN IF NOT EXISTS pause_reason text;

-- Update existing paused ads to have 'manual' as pause_reason
UPDATE public.ads
SET pause_reason = 'manual'
WHERE status = 'paused' AND pause_reason IS NULL;