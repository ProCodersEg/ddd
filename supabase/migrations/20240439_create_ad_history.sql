-- Create ad_history table
CREATE TABLE IF NOT EXISTS ad_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  action_type ad_action NOT NULL,
  ad_title TEXT NOT NULL,
  ad_description TEXT,
  ad_image TEXT,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ad_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON ad_history;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON ad_history;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON ad_history;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON ad_history;

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

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS ad_changes_trigger ON ads;
DROP FUNCTION IF EXISTS log_ad_changes();

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
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log update if content-related fields changed (not just clicks)
    IF NEW.title != OLD.title OR 
       NEW.description != OLD.description OR 
       NEW.image_url != OLD.image_url OR
       NEW.redirect_url != OLD.redirect_url OR
       NEW.status != OLD.status OR
       NEW.max_clicks != OLD.max_clicks THEN
      
      INSERT INTO ad_history (ad_id, action_type, ad_title, ad_description, ad_image, clicks)
      VALUES (NEW.id, 'updated', NEW.title, NEW.description, NEW.image_url, NEW.clicks);
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO ad_history (ad_id, action_type, ad_title, ad_description, ad_image, clicks)
    VALUES (OLD.id, 'deleted', OLD.title, OLD.description, OLD.image_url, OLD.clicks);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger that fires BEFORE DELETE
CREATE TRIGGER ad_changes_trigger
  BEFORE DELETE ON ads
  FOR EACH ROW
  EXECUTE FUNCTION log_ad_changes();

-- Create separate trigger for INSERT and UPDATE
CREATE TRIGGER ad_changes_trigger_insert_update
  AFTER INSERT OR UPDATE ON ads
  FOR EACH ROW
  EXECUTE FUNCTION log_ad_changes();