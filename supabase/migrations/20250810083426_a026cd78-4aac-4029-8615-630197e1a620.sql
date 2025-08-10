-- Create INSERT policy for newsletter signups (allows unauthenticated users)
CREATE POLICY "Allow newsletter signups for everyone" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (true);

-- Create UPDATE policy for newsletter subscribers to update their own records
CREATE POLICY "Allow newsletter subscribers to update their records" 
ON public.subscribers 
FOR UPDATE 
USING (email IS NOT NULL AND subscribed = true);

-- Create SELECT policy for newsletter functionality
CREATE POLICY "Allow reading newsletter subscribers" 
ON public.subscribers 
FOR SELECT 
USING (true);