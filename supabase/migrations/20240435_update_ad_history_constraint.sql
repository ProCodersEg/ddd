-- First drop the existing foreign key constraint
ALTER TABLE ad_history
DROP CONSTRAINT ad_history_ad_id_fkey;

-- Add the new constraint with ON DELETE CASCADE
ALTER TABLE ad_history
ADD CONSTRAINT ad_history_ad_id_fkey 
FOREIGN KEY (ad_id) 
REFERENCES ads(id) 
ON DELETE CASCADE;