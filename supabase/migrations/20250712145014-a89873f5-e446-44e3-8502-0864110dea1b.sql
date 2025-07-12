-- Create a temporary function to generate mock data for any authenticated user
DO $$
DECLARE
    mock_user_id uuid;
BEGIN
    -- Try to get the current authenticated user ID, or create a placeholder
    SELECT COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid) INTO mock_user_id;
    
    -- If we don't have an authenticated user, we can't proceed with RLS enabled
    -- This migration should be run when a user is logged in
    IF mock_user_id = '00000000-0000-0000-0000-000000000000'::uuid THEN
        RAISE EXCEPTION 'Please run this migration while logged in as a user';
    END IF;

    -- Insert 40 mock timers with different names and categories
    INSERT INTO public.timers (user_id, name, category, created_at, elapsed_time) VALUES
    -- June timers (Week 1)
    (mock_user_id, 'Morning Workout', 'Exercise', '2024-06-01 07:00:00+00', 1800000),
    (mock_user_id, 'Email Processing', 'Work', '2024-06-01 09:30:00+00', 2700000),
    (mock_user_id, 'React Development', 'Work', '2024-06-02 10:00:00+00', 14400000),
    (mock_user_id, 'Spanish Lessons', 'Study', '2024-06-02 19:00:00+00', 3600000),
    (mock_user_id, 'Meditation Session', 'Personal', '2024-06-03 06:00:00+00', 1200000),
    (mock_user_id, 'Client Meeting Prep', 'Work', '2024-06-03 14:00:00+00', 5400000),
    (mock_user_id, 'Yoga Practice', 'Exercise', '2024-06-04 07:30:00+00', 2700000),
    (mock_user_id, 'Database Design', 'Work', '2024-06-04 11:00:00+00', 10800000),

    -- June timers (Week 2)
    (mock_user_id, 'Reading Fiction', 'Personal', '2024-06-05 20:00:00+00', 3600000),
    (mock_user_id, 'Code Review', 'Work', '2024-06-06 13:00:00+00', 7200000),
    (mock_user_id, 'Piano Practice', 'Personal', '2024-06-07 16:00:00+00', 2400000),
    (mock_user_id, 'Bug Fixing', 'Work', '2024-06-08 10:30:00+00', 9000000),
    (mock_user_id, 'Evening Run', 'Exercise', '2024-06-08 18:00:00+00', 2700000),
    (mock_user_id, 'API Documentation', 'Work', '2024-06-09 15:00:00+00', 5400000),
    (mock_user_id, 'Cooking Practice', 'Personal', '2024-06-10 17:30:00+00', 4500000),
    (mock_user_id, 'UI Design', 'Work', '2024-06-11 09:00:00+00', 12600000),

    -- June timers (Week 3)
    (mock_user_id, 'French Study', 'Study', '2024-06-12 19:30:00+00', 3000000),
    (mock_user_id, 'Team Standup', 'Work', '2024-06-13 09:15:00+00', 1800000),
    (mock_user_id, 'Strength Training', 'Exercise', '2024-06-14 06:30:00+00', 3600000),
    (mock_user_id, 'Feature Development', 'Work', '2024-06-15 11:30:00+00', 16200000),
    (mock_user_id, 'Podcast Recording', 'Personal', '2024-06-16 14:00:00+00', 5400000),
    (mock_user_id, 'Testing & QA', 'Work', '2024-06-17 10:00:00+00', 7200000),
    (mock_user_id, 'Guitar Practice', 'Personal', '2024-06-18 20:30:00+00', 2700000),
    (mock_user_id, 'Research Task', 'Study', '2024-06-19 13:30:00+00', 4500000),

    -- June timers (Week 4)
    (mock_user_id, 'Morning Pages', 'Personal', '2024-06-20 06:30:00+00', 1800000),
    (mock_user_id, 'Sprint Planning', 'Work', '2024-06-21 09:00:00+00', 5400000),
    (mock_user_id, 'Swimming', 'Exercise', '2024-06-22 07:00:00+00', 3000000),
    (mock_user_id, 'Backend Optimization', 'Work', '2024-06-23 12:00:00+00', 10800000),
    (mock_user_id, 'Photography Walk', 'Personal', '2024-06-24 16:00:00+00', 7200000),
    (mock_user_id, 'Security Audit', 'Work', '2024-06-25 14:30:00+00', 9000000),
    (mock_user_id, 'Journaling', 'Personal', '2024-06-26 21:00:00+00', 1200000),

    -- July timers
    (mock_user_id, 'Machine Learning Study', 'Study', '2024-07-01 10:00:00+00', 7200000),
    (mock_user_id, 'Cycling', 'Exercise', '2024-07-02 17:00:00+00', 3600000),
    (mock_user_id, 'Product Planning', 'Work', '2024-07-03 11:00:00+00', 6300000),
    (mock_user_id, 'Language Exchange', 'Study', '2024-07-04 19:00:00+00', 3600000),
    (mock_user_id, 'Deployment Pipeline', 'Work', '2024-07-05 13:00:00+00', 8100000),
    (mock_user_id, 'Rock Climbing', 'Exercise', '2024-07-06 15:00:00+00', 5400000),
    (mock_user_id, 'Blog Writing', 'Personal', '2024-07-07 20:00:00+00', 4500000),
    (mock_user_id, 'Algorithm Practice', 'Study', '2024-07-08 14:00:00+00', 5400000),
    (mock_user_id, 'Containerization', 'Work', '2024-07-09 10:30:00+00', 7200000),
    (mock_user_id, 'Hiking Prep', 'Exercise', '2024-07-10 08:00:00+00', 1800000),
    (mock_user_id, 'Portfolio Update', 'Personal', '2024-07-11 16:30:00+00', 3600000);

    -- Insert timer sessions for each timer
    INSERT INTO public.timer_sessions (timer_id, user_id, start_time, end_time, duration_ms)
    SELECT 
      t.id,
      t.user_id,
      t.created_at + (INTERVAL '1 day' * (row_number() over (partition by t.id order by random()) - 1)) as start_time,
      t.created_at + (INTERVAL '1 day' * (row_number() over (partition by t.id order by random()) - 1)) + 
        (INTERVAL '1 millisecond' * (300000 + random() * t.elapsed_time)) as end_time,
      (300000 + random() * t.elapsed_time)::bigint as duration_ms
    FROM public.timers t
    CROSS JOIN generate_series(1, 3) -- Generate 3 sessions per timer
    WHERE t.user_id = mock_user_id
    AND t.created_at >= '2024-06-01'::date;

END $$;