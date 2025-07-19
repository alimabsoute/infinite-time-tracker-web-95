-- Create the generate_unique_timer_name function that was missing
CREATE OR REPLACE FUNCTION public.generate_unique_timer_name(p_user_id UUID)
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