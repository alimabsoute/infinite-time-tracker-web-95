-- Remove the public read access policy that exposes customer data
DROP POLICY IF EXISTS "Allow reading newsletter subscribers" ON public.subscribers;

-- Remove the update policy that allows anyone with an email to update records
DROP POLICY IF EXISTS "Allow newsletter subscribers to update their records" ON public.subscribers;

-- Add unique constraint on email to handle duplicates gracefully
ALTER TABLE public.subscribers 
ADD CONSTRAINT unique_subscriber_email UNIQUE (email);

-- Create a secure function for newsletter signups that doesn't expose existing emails
CREATE OR REPLACE FUNCTION public.safe_newsletter_signup(
    p_email text,
    p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    -- Attempt to insert new subscriber
    BEGIN
        INSERT INTO public.subscribers (email, user_id, subscribed, created_at)
        VALUES (
            lower(p_email), 
            COALESCE(p_user_id, gen_random_uuid()), 
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