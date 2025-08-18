-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous newsletter signups with validation" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Allow newsletter subscribers to view their own data" ON public.newsletter_subscribers;

-- Create a separate table for newsletter subscribers to isolate from paid subscription data
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed BOOLEAN NOT NULL DEFAULT true,
  source TEXT CHECK (source IN ('hero', 'popup', 'footer')) DEFAULT 'popup',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Security: Add rate limiting fields
  last_signup_attempt TIMESTAMPTZ DEFAULT now(),
  signup_attempts_count INTEGER DEFAULT 1
);

-- Enable RLS on newsletter_subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policies for newsletter_subscribers
CREATE POLICY "Newsletter signup validation policy" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (
  -- Basic email format validation at DB level
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND email = lower(email)
  AND length(email) <= 254
  AND length(email) >= 5
);

CREATE POLICY "Newsletter subscribers read policy" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (true); -- Allow read for analytics, but limit what's returned in app

-- Secure the main subscribers table for authenticated users only
DROP POLICY IF EXISTS "Allow newsletter signups for everyone" ON public.subscribers;

CREATE POLICY "Authenticated subscription management" 
ON public.subscribers 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated subscription creation" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

-- Create a secure newsletter signup function
CREATE OR REPLACE FUNCTION public.secure_newsletter_signup(p_email text, p_source text DEFAULT 'popup')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result jsonb;
    normalized_email text;
    recent_attempts integer;
    last_attempt timestamptz;
BEGIN
    -- Normalize and validate email
    normalized_email := lower(trim(p_email));
    
    -- Validate email format
    IF NOT (normalized_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Invalid email format',
            'already_subscribed', false
        );
    END IF;
    
    -- Validate source
    IF p_source NOT IN ('hero', 'popup', 'footer') THEN
        p_source := 'popup';
    END IF;
    
    -- Rate limiting: Check for abuse (more than 5 attempts in last hour from same email domain)
    SELECT COUNT(*), MAX(created_at)
    INTO recent_attempts, last_attempt
    FROM newsletter_subscribers 
    WHERE split_part(email, '@', 2) = split_part(normalized_email, '@', 2)
      AND created_at > NOW() - INTERVAL '1 hour';
      
    IF recent_attempts >= 5 THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Too many signup attempts. Please try again later.',
            'already_subscribed', false
        );
    END IF;
    
    -- Attempt to insert new subscriber
    BEGIN
        INSERT INTO public.newsletter_subscribers (email, source, subscribed, created_at)
        VALUES (normalized_email, p_source, true, now());
        
        result := jsonb_build_object(
            'success', true,
            'message', 'Successfully subscribed',
            'already_subscribed', false
        );
        
    EXCEPTION WHEN unique_violation THEN
        -- Email already exists, update subscription status if unsubscribed
        UPDATE newsletter_subscribers 
        SET subscribed = true, 
            updated_at = now(),
            signup_attempts_count = signup_attempts_count + 1,
            last_signup_attempt = now()
        WHERE email = normalized_email;
        
        result := jsonb_build_object(
            'success', true,
            'message', 'Already subscribed',
            'already_subscribed', true
        );
    END;
    
    RETURN result;
END;
$$;