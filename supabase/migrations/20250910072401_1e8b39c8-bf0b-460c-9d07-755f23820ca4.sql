-- Fix critical security vulnerability: Remove public access to newsletter subscriber emails
-- and implement proper admin-only access control

-- First, create an app_role enum for user roles
CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- FIX SECURITY VULNERABILITY: Remove public SELECT access to newsletter_subscribers
DROP POLICY IF EXISTS "Newsletter subscribers read policy" ON public.newsletter_subscribers;

-- Add admin-only SELECT policy for newsletter subscribers
CREATE POLICY "Admins can view newsletter subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (public.is_admin());

-- Keep existing INSERT policy for newsletter signup functionality
-- The "Newsletter signup validation policy" remains unchanged

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Insert first admin user (replace with actual admin user ID when known)
-- This is commented out - you'll need to manually add admin users
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('YOUR_ADMIN_USER_ID', 'admin') 
-- ON CONFLICT (user_id, role) DO NOTHING;