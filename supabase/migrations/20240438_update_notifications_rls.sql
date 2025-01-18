-- Allow the trigger function to insert notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for service role" ON notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Update the trigger function to use security definer
CREATE OR REPLACE FUNCTION handle_ad_status_change()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'paused' AND OLD.status = 'active' THEN
    INSERT INTO notifications (
      ad_id,
      ad_title,
      ad_image,
      message,
      read
    ) VALUES (
      NEW.id,
      NEW.title,
      NEW.image_url,
      'Ad has been paused after reaching its click limit.',
      false
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS ad_status_change_trigger ON ads;
CREATE TRIGGER ad_status_change_trigger
  AFTER UPDATE ON ads
  FOR EACH ROW
  WHEN (NEW.status = 'paused' AND OLD.status = 'active')
  EXECUTE FUNCTION handle_ad_status_change();