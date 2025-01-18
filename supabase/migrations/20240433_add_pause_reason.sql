-- Add pause_reason column to ads table with type check
ALTER TABLE public.ads
ADD COLUMN IF NOT EXISTS pause_reason text CHECK (pause_reason IN ('manual', 'limits') OR pause_reason IS NULL);

-- Update existing paused ads to have 'manual' as pause_reason
UPDATE public.ads
SET pause_reason = 'manual'
WHERE status = 'paused' AND pause_reason IS NULL;

-- Add comment to the column
COMMENT ON COLUMN public.ads.pause_reason IS 'Reason for ad being paused: manual or limits';