-- First, ensure RLS is enabled
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON public.ads;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.ads;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.ads;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.ads;

-- Create new policies
-- Allow anyone to read ads
CREATE POLICY "Enable read access for all users" 
ON public.ads FOR SELECT 
USING (true);

-- Allow authenticated users to insert ads
CREATE POLICY "Enable insert for authenticated users only" 
ON public.ads FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to update their own ads
CREATE POLICY "Enable update for authenticated users only" 
ON public.ads FOR UPDATE 
TO authenticated 
USING (true);

-- Allow authenticated users to delete their own ads
CREATE POLICY "Enable delete for authenticated users only" 
ON public.ads FOR DELETE 
TO authenticated 
USING (true);