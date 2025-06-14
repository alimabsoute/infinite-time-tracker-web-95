
-- Add deletion tracking columns to the timers table
ALTER TABLE public.timers 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN deleted_by UUID REFERENCES auth.users;

-- Create index for better query performance on deleted_at
CREATE INDEX idx_timers_deleted_at ON public.timers(deleted_at);

-- Update RLS policies to include deleted timers in user access
-- The existing policies already work since they filter by user_id
-- Deleted timers will still be accessible to their owners

-- Add a comment to document the soft delete approach
COMMENT ON COLUMN public.timers.deleted_at IS 'Timestamp when the timer was soft deleted. NULL means not deleted.';
COMMENT ON COLUMN public.timers.deleted_by IS 'User ID who performed the deletion';
