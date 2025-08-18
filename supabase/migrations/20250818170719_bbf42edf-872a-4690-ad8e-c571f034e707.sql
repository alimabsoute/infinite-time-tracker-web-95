-- Fix all remaining database functions to have proper search_path
CREATE OR REPLACE FUNCTION public.update_timer_last_accessed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.last_accessed_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.profiles 
    SET last_login_at = now() 
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_unique_timer_name(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.get_accurate_timer_time(timer_uuid uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.recover_missing_timer_time(timer_uuid uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create a profile entry
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  -- Create a subscriber entry
  INSERT INTO public.subscribers (user_id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;