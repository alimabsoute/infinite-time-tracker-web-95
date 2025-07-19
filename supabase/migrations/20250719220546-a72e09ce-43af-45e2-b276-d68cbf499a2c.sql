-- Reset all timer elapsed times to 0 for clean testing
-- This will fix the accumulated incorrect times
UPDATE timers SET elapsed_time = 0, is_running = false WHERE deleted_at IS NULL;

-- Optional: Clear all timer sessions for clean slate
DELETE FROM timer_sessions;