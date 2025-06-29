
-- Add columns to track running timer limits and history cleanup
ALTER TABLE public.timers 
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_timers_last_accessed_at ON public.timers(last_accessed_at, user_id);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_created_at ON public.timer_sessions(created_at, user_id);

-- Update trigger to track last accessed time when timers are updated
CREATE OR REPLACE FUNCTION update_timer_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_accessed_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tracking timer access
DROP TRIGGER IF EXISTS trigger_update_timer_last_accessed ON public.timers;
CREATE TRIGGER trigger_update_timer_last_accessed
    BEFORE UPDATE ON public.timers
    FOR EACH ROW
    EXECUTE FUNCTION update_timer_last_accessed();

-- Add RLS policies for timer cleanup (allow service role to delete old data)
CREATE POLICY "Service role can delete old timer data" 
ON public.timers 
FOR DELETE 
USING (current_setting('role') = 'service_role');

CREATE POLICY "Service role can delete old session data" 
ON public.timer_sessions 
FOR DELETE 
USING (current_setting('role') = 'service_role');
