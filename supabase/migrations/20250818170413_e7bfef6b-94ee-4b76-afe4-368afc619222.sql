-- Make user_id nullable for anonymous newsletter signups
ALTER TABLE public.subscribers ALTER COLUMN user_id DROP NOT NULL;

-- Drop the existing foreign key constraint if it exists
ALTER TABLE public.subscribers DROP CONSTRAINT IF EXISTS subscribers_user_id_fkey;

-- Add a new optional foreign key constraint that allows nulls
ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add email format validation
ALTER TABLE public.subscribers ADD CONSTRAINT valid_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Update the safe_newsletter_signup function to handle anonymous signups
CREATE OR REPLACE FUNCTION public.safe_newsletter_signup(p_email text, p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result jsonb;
BEGIN
    -- Attempt to insert new subscriber (user_id can be null for anonymous signups)
    BEGIN
        INSERT INTO public.subscribers (email, user_id, subscribed, created_at)
        VALUES (
            lower(p_email), 
            p_user_id,  -- This can be null for anonymous signups
            true, 
            now()
        );
        
        result := jsonb_build_object(
            'success', true,
            'message', 'Successfully subscribed',
            'already_subscribed', false
        );
        
    EXCEPTION WHEN unique_violation THEN
        -- Email already exists, return success but indicate already subscribed
        result := jsonb_build_object(
            'success', true,
            'message', 'Already subscribed',
            'already_subscribed', true
        );
    END;
    
    RETURN result;
END;
$$;