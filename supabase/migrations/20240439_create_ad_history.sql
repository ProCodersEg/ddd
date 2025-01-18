-- Create ad_history table
CREATE TABLE IF NOT EXISTS ad_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES ads(id) ON DELETE SET NULL,
  action_type TEXT CHECK (action_type IN ('added', 'updated', 'deleted')),
  ad_title TEXT,
  ad_description TEXT,
  ad_image TEXT,
  clicks INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ad_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON ad_history;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON ad_history;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON ad_history;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON ad_history
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON ad_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON ad_history
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger function to track ad changes
CREATE OR REPLACE FUNCTION log_ad_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For INSERT operations
  IF TG_OP = 'INSERT' THEN
    INSERT INTO ad_history (ad_id, action_type, ad_title, ad_description, ad_image, clicks)
    VALUES (NEW.id, 'added', NEW.title, NEW.description, NEW.image_url, NEW.clicks);
    
  -- For UPDATE operations
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log update if something other than clicks changed
    IF NEW.title != OLD.title OR 
       NEW.description != OLD.description OR 
       NEW.image_url != OLD.image_url OR
       NEW.redirect_url != OLD.redirect_url OR
       NEW.status != OLD.status OR
       NEW.max_clicks != OLD.max_clicks THEN
      
      INSERT INTO ad_history (ad_id, action_type, ad_title, ad_description, ad_image, clicks)
      VALUES (NEW.id, 'updated', NEW.title, NEW.description, NEW.image_url, NEW.clicks);
    END IF;
    
  -- For DELETE operations
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO ad_history (ad_id, action_type, ad_title, ad_description, ad_image, clicks)
    VALUES (OLD.id, 'deleted', OLD.title, OLD.description, OLD.image_url, OLD.clicks);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS ad_changes_trigger ON ads;

-- Create trigger
CREATE TRIGGER ad_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON ads
  FOR EACH ROW
  EXECUTE FUNCTION log_ad_changes();