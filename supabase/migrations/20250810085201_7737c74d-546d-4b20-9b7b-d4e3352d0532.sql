-- Timer Accuracy Fix: Recover Lost Time and Implement Robust Persistence
-- Phase 1: Data Recovery for PS5 Timer and others

-- Function to calculate accurate timer time including active sessions
CREATE OR REPLACE FUNCTION get_accurate_timer_time(timer_uuid UUID)
RETURNS BIGINT AS $$
DECLARE
    timer_record RECORD;
    active_session RECORD;
    total_time BIGINT;
    session_time BIGINT;
BEGIN
    -- Get timer info
    SELECT elapsed_time, is_running INTO timer_record 
    FROM timers WHERE id = timer_uuid;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    total_time := timer_record.elapsed_time;
    
    -- If timer is running, add current session time
    IF timer_record.is_running THEN
        SELECT start_time INTO active_session
        FROM timer_sessions 
        WHERE timer_id = timer_uuid AND end_time IS NULL
        ORDER BY start_time DESC LIMIT 1;
        
        IF FOUND THEN
            session_time := EXTRACT(EPOCH FROM (NOW() - active_session.start_time)) * 1000;
            total_time := total_time + session_time;
        END IF;
    END IF;
    
    RETURN total_time;
END;
$$ LANGUAGE plpgsql;

-- Function to detect and recover missing time gaps
CREATE OR REPLACE FUNCTION recover_missing_timer_time(timer_uuid UUID)
RETURNS BIGINT AS $$
DECLARE
    last_session RECORD;
    current_session RECORD;
    gap_duration BIGINT;
    timer_record RECORD;
BEGIN
    -- Get timer info
    SELECT is_running INTO timer_record FROM timers WHERE id = timer_uuid;
    
    IF NOT timer_record.is_running THEN
        RETURN 0; -- Only recover for currently running timers
    END IF;
    
    -- Get last completed session
    SELECT end_time INTO last_session
    FROM timer_sessions 
    WHERE timer_id = timer_uuid AND end_time IS NOT NULL
    ORDER BY end_time DESC LIMIT 1;
    
    -- Get current active session
    SELECT start_time INTO current_session
    FROM timer_sessions 
    WHERE timer_id = timer_uuid AND end_time IS NULL
    ORDER BY start_time DESC LIMIT 1;
    
    -- Calculate gap if both sessions exist
    IF FOUND AND last_session.end_time IS NOT NULL AND current_session.start_time IS NOT NULL THEN
        gap_duration := EXTRACT(EPOCH FROM (current_session.start_time - last_session.end_time)) * 1000;
        
        -- Only consider significant gaps (> 1 minute) but reasonable (< 7 days)
        IF gap_duration > 60000 AND gap_duration < 604800000 THEN
            -- Add gap time to elapsed_time
            UPDATE timers 
            SET elapsed_time = elapsed_time + gap_duration,
                last_accessed_at = NOW()
            WHERE id = timer_uuid;
            
            RETURN gap_duration;
        END IF;
    END IF;
    
    RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Clean up orphaned sessions (older than 4 hours with no end_time)
DELETE FROM timer_sessions 
WHERE end_time IS NULL 
  AND start_time < NOW() - INTERVAL '4 hours';

-- Recover missing time for currently running timers
DO $$
DECLARE
    timer_rec RECORD;
    recovered_time BIGINT;
BEGIN
    FOR timer_rec IN 
        SELECT id, name FROM timers WHERE is_running = true
    LOOP
        recovered_time := recover_missing_timer_time(timer_rec.id);
        IF recovered_time > 0 THEN
            RAISE NOTICE 'Recovered % ms (%.2f hours) for timer: %', 
                recovered_time, 
                recovered_time::FLOAT / 3600000, 
                timer_rec.name;
        END IF;
    END LOOP;
END;
$$;

-- Add index for better performance on session queries
CREATE INDEX IF NOT EXISTS idx_timer_sessions_timer_active 
ON timer_sessions(timer_id, end_time) WHERE end_time IS NULL;

-- Add index for timer access patterns
CREATE INDEX IF NOT EXISTS idx_timers_running_user 
ON timers(user_id, is_running) WHERE is_running = true;