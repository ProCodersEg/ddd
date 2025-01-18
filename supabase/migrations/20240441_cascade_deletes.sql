-- Add cascading delete to ad_history table
ALTER TABLE ad_history
DROP CONSTRAINT IF EXISTS ad_history_ad_id_fkey,
ADD CONSTRAINT ad_history_ad_id_fkey 
  FOREIGN KEY (ad_id) 
  REFERENCES ads(id) 
  ON DELETE CASCADE;

-- Add policy for cascading deletes
DROP POLICY IF EXISTS "Enable cascade deletes for authenticated users" ON ad_history;
CREATE POLICY "Enable cascade deletes for authenticated users" ON ad_history
  FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');