
-- Step 1: Clean up duplicate "New Timer" entries
-- First, let's identify and keep only the most recent timer for each user that has "New Timer" name
WITH ranked_new_timers AS (
  SELECT id, user_id, name, created_at, is_running,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
  FROM timers 
  WHERE name = 'New Timer' 
    AND deleted_at IS NULL
),
timers_to_keep AS (
  SELECT id FROM ranked_new_timers WHERE rn = 1
)
UPDATE timers 
SET deleted_at = now(), 
    deleted_by = user_id,
    is_running = false
WHERE name = 'New Timer' 
  AND deleted_at IS NULL 
  AND id NOT IN (SELECT id FROM timers_to_keep);

-- Step 2: Add unique constraint to prevent multiple running timers per user
-- First, create a partial unique index for running timers
CREATE UNIQUE INDEX CONCURRENTLY idx_unique_running_timer_per_user 
ON timers (user_id) 
WHERE is_running = true AND deleted_at IS NULL;

-- Step 3: Add a function to generate unique timer names
CREATE OR REPLACE FUNCTION generate_unique_timer_name(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    base_name TEXT := 'Timer';
    counter INTEGER := 1;
    test_name TEXT;
    name_exists BOOLEAN;
BEGIN
    -- Start with "Timer 1", "Timer 2", etc.
    LOOP
        test_name := base_name || ' ' || counter;
        
        -- Check if this name exists for the user
        SELECT EXISTS(
            SELECT 1 FROM timers 
            WHERE user_id = p_user_id 
              AND name = test_name 
              AND deleted_at IS NULL
        ) INTO name_exists;
        
        -- If name doesn't exist, use it
        IF NOT name_exists THEN
            RETURN test_name;
        END IF;
        
        -- Try next number
        counter := counter + 1;
        
        -- Safety check to prevent infinite loop
        IF counter > 1000 THEN
            RETURN base_name || ' ' || extract(epoch from now())::bigint;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create a trigger to ensure unique running timers
CREATE OR REPLACE FUNCTION ensure_single_running_timer()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a timer to running, stop all other running timers for this user
    IF NEW.is_running = true AND NEW.deleted_at IS NULL THEN
        UPDATE timers 
        SET is_running = false 
        WHERE user_id = NEW.user_id 
          AND id != NEW.id 
          AND is_running = true 
          AND deleted_at IS NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_ensure_single_running_timer ON timers;
CREATE TRIGGER trigger_ensure_single_running_timer
    BEFORE INSERT OR UPDATE ON timers
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_running_timer();

-- Step 5: Add enhanced session cleanup
CREATE OR REPLACE FUNCTION cleanup_orphaned_sessions()
RETURNS void AS $$
BEGIN
    -- End sessions for timers that are no longer running
    UPDATE timer_sessions 
    SET end_time = now(),
        duration_ms = EXTRACT(EPOCH FROM (now() - start_time)) * 1000
    WHERE end_time IS NULL 
      AND timer_id IN (
          SELECT t.id FROM timers t 
          WHERE t.is_running = false OR t.deleted_at IS NOT NULL
      );
END;
$$ LANGUAGE plpgsql;

-- Run the cleanup
SELECT cleanup_orphaned_sessions();
