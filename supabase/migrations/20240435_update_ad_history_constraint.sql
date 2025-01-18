-- First drop the existing foreign key constraint if it exists
ALTER TABLE IF EXISTS ad_history 
DROP CONSTRAINT IF EXISTS ad_history_ad_id_fkey;

-- Add the new constraint WITHOUT cascade delete
ALTER TABLE ad_history
ADD CONSTRAINT ad_history_ad_id_fkey 
FOREIGN KEY (ad_id) 
REFERENCES ads(id) 
ON DELETE RESTRICT;

-- Update the action_type enum if needed
ALTER TABLE ad_history 
DROP CONSTRAINT IF EXISTS ad_history_action_type_check;

ALTER TABLE ad_history 
ADD CONSTRAINT ad_history_action_type_check 
CHECK (action_type IN ('added', 'updated'));