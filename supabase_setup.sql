
-- Create timers table with the schema we need
CREATE TABLE IF NOT EXISTS public.timers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  elapsed_time BIGINT NOT NULL DEFAULT 0,
  is_running BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  category TEXT,
  tags TEXT[],
  deadline TIMESTAMPTZ,
  priority SMALLINT CHECK (priority BETWEEN 1 AND 5)
);

-- Enable Row Level Security
ALTER TABLE public.timers ENABLE ROW LEVEL SECURITY;

-- Create policy so users can only access their own timers
CREATE POLICY "Users can only access their own timers" 
  ON public.timers
  FOR ALL
  USING (auth.uid() = user_id);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_timers_user_id ON public.timers(user_id);
