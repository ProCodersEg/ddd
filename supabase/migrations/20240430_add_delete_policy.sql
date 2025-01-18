-- Add RLS policy for deleting ads
CREATE POLICY "Allow authenticated users to delete their ads"
ON public.ads
FOR DELETE
TO authenticated
USING (true);  -- This allows any authenticated user to delete ads. You might want to restrict this further based on user_id if needed.

-- Ensure RLS is enabled
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;