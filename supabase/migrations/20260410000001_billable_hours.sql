-- Add billable hours support to timers table
ALTER TABLE public.timers
  ADD COLUMN IF NOT EXISTS billable BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2);

COMMENT ON COLUMN public.timers.billable IS 'Whether time tracked on this timer is billable to a client';
COMMENT ON COLUMN public.timers.hourly_rate IS 'Hourly rate in USD for billing calculations. NULL inherits from user profile or defaults to 0.';
