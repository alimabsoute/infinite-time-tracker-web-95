
-- Create timers table with soft-delete columns
CREATE TABLE IF NOT EXISTS public.timers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  elapsed_time BIGINT NOT NULL DEFAULT 0,
  is_running BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  category TEXT,
  tags TEXT[],
  deadline TIMESTAMPTZ,
  priority SMALLINT CHECK (priority BETWEEN 1 AND 5),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users
);

-- Add comments to document the soft delete approach
COMMENT ON COLUMN public.timers.deleted_at IS 'Timestamp when the timer was soft deleted. NULL means not deleted.';
COMMENT ON COLUMN public.timers.deleted_by IS 'User ID who performed the deletion';

-- Enable Row Level Security on timers
ALTER TABLE public.timers ENABLE ROW LEVEL SECURITY;

-- Create policy so users can only access their own timers
CREATE POLICY "Users can only access their own timers" 
  ON public.timers
  FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes for better query performance on timers
CREATE INDEX IF NOT EXISTS idx_timers_user_id ON public.timers(user_id);
CREATE INDEX IF NOT EXISTS idx_timers_deleted_at ON public.timers(deleted_at);

-- Create timer_sessions table to track individual work periods
CREATE TABLE IF NOT EXISTS public.timer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timer_id UUID NOT NULL REFERENCES public.timers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_ms BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security on timer_sessions
ALTER TABLE public.timer_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy so users can manage their own sessions
CREATE POLICY "Users can manage their own timer sessions"
  ON public.timer_sessions
  FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes for better query performance on timer_sessions
CREATE INDEX IF NOT EXISTS idx_timer_sessions_timer_id ON public.timer_sessions(timer_id);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_user_id ON public.timer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_start_time ON public.timer_sessions(start_time);


-- Create profiles table for user-specific data like subscriptions
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  subscribed BOOLEAN DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ
);

-- Enable Row Level Security on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$;

-- Trigger to call handle_new_user on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

