-- Fix: Remove the public SELECT policy on newsletter_subscribers table
-- This policy allows anyone on the internet to read customer email addresses

DROP POLICY IF EXISTS "Newsletter subscribers read policy" ON public.newsletter_subscribers;