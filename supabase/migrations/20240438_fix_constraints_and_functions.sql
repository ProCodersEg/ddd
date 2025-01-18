-- First, drop the existing foreign key constraint
ALTER TABLE ad_history
DROP CONSTRAINT IF EXISTS ad_history_ad_id_fkey;

-- Re-create the constraint with ON DELETE CASCADE
ALTER TABLE ad_history
ADD CONSTRAINT ad_history_ad_id_fkey 
FOREIGN KEY (ad_id) 
REFERENCES ads(id) 
ON DELETE CASCADE;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS delete_all_history();

-- Create function to delete all history entries
CREATE OR REPLACE FUNCTION delete_all_history()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count integer;
BEGIN
    WITH deleted AS (
        DELETE FROM ad_history
        RETURNING *
    )
    SELECT count(*) INTO deleted_count
    FROM deleted;
    
    RETURN json_build_object(
        'success', true,
        'deleted_count', deleted_count
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_all_history() TO authenticated;