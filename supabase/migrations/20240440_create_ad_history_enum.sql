-- Check if enum type exists and drop it if it does
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ad_action') THEN
        DROP TYPE ad_action CASCADE;
    END IF;
END $$;

-- Create enum type for action_type
CREATE TYPE ad_action AS ENUM ('added', 'updated', 'deleted');

-- Drop existing ad_history table if it exists
DROP TABLE IF EXISTS ad_history;

-- Recreate ad_history table with correct enum type
CREATE TABLE ad_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES ads(id) ON DELETE SET NULL,
  action_type ad_action NOT NULL,
  ad_title TEXT NOT NULL,
  ad_description TEXT,
  ad_image TEXT,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ad_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON ad_history
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON ad_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON ad_history
  FOR DELETE
  TO authenticated
  USING (true);

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION log_ad_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO ad_history (ad_id, action_type, ad_title, ad_description, ad_image, clicks)
    VALUES (NEW.id, 'added', NEW.title, NEW.description, NEW.image_url, NEW.clicks);
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO ad_history (ad_id, action_type, ad_title, ad_description, ad_image, clicks)
    VALUES (NEW.id, 'updated', NEW.title, NEW.description, NEW.image_url, NEW.clicks);
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO ad_history (ad_id, action_type, ad_title, ad_description, ad_image, clicks)
    VALUES (OLD.id, 'deleted', OLD.title, OLD.description, OLD.image_url, OLD.clicks);
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS ad_changes_trigger ON ads;

-- Create trigger
CREATE TRIGGER ad_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON ads
  FOR EACH ROW
  EXECUTE FUNCTION log_ad_changes();