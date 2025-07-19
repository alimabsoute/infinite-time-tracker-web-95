-- Add start_time field to timers table for simple timer tracking
ALTER TABLE public.timers 
ADD COLUMN start_time timestamp with time zone;