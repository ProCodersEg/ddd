-- Drop existing foreign key constraint
ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS notifications_ad_id_fkey;

-- Re-create foreign key constraint with CASCADE
ALTER TABLE notifications
ADD CONSTRAINT notifications_ad_id_fkey
FOREIGN KEY (ad_id)
REFERENCES ads(id)
ON DELETE CASCADE;