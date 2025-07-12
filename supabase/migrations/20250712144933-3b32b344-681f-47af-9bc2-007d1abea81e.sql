-- Insert 40 mock timers with different names and categories
INSERT INTO public.timers (user_id, name, category, created_at, elapsed_time) VALUES
-- June timers (Week 1)
(auth.uid(), 'Morning Workout', 'Exercise', '2024-06-01 07:00:00+00', 1800000),
(auth.uid(), 'Email Processing', 'Work', '2024-06-01 09:30:00+00', 2700000),
(auth.uid(), 'React Development', 'Work', '2024-06-02 10:00:00+00', 14400000),
(auth.uid(), 'Spanish Lessons', 'Study', '2024-06-02 19:00:00+00', 3600000),
(auth.uid(), 'Meditation Session', 'Personal', '2024-06-03 06:00:00+00', 1200000),
(auth.uid(), 'Client Meeting Prep', 'Work', '2024-06-03 14:00:00+00', 5400000),
(auth.uid(), 'Yoga Practice', 'Exercise', '2024-06-04 07:30:00+00', 2700000),
(auth.uid(), 'Database Design', 'Work', '2024-06-04 11:00:00+00', 10800000),

-- June timers (Week 2)
(auth.uid(), 'Reading Fiction', 'Personal', '2024-06-05 20:00:00+00', 3600000),
(auth.uid(), 'Code Review', 'Work', '2024-06-06 13:00:00+00', 7200000),
(auth.uid(), 'Piano Practice', 'Personal', '2024-06-07 16:00:00+00', 2400000),
(auth.uid(), 'Bug Fixing', 'Work', '2024-06-08 10:30:00+00', 9000000),
(auth.uid(), 'Evening Run', 'Exercise', '2024-06-08 18:00:00+00', 2700000),
(auth.uid(), 'API Documentation', 'Work', '2024-06-09 15:00:00+00', 5400000),
(auth.uid(), 'Cooking Practice', 'Personal', '2024-06-10 17:30:00+00', 4500000),
(auth.uid(), 'UI Design', 'Work', '2024-06-11 09:00:00+00', 12600000),

-- June timers (Week 3)
(auth.uid(), 'French Study', 'Study', '2024-06-12 19:30:00+00', 3000000),
(auth.uid(), 'Team Standup', 'Work', '2024-06-13 09:15:00+00', 1800000),
(auth.uid(), 'Strength Training', 'Exercise', '2024-06-14 06:30:00+00', 3600000),
(auth.uid(), 'Feature Development', 'Work', '2024-06-15 11:30:00+00', 16200000),
(auth.uid(), 'Podcast Recording', 'Personal', '2024-06-16 14:00:00+00', 5400000),
(auth.uid(), 'Testing & QA', 'Work', '2024-06-17 10:00:00+00', 7200000),
(auth.uid(), 'Guitar Practice', 'Personal', '2024-06-18 20:30:00+00', 2700000),
(auth.uid(), 'Research Task', 'Study', '2024-06-19 13:30:00+00', 4500000),

-- June timers (Week 4)
(auth.uid(), 'Morning Pages', 'Personal', '2024-06-20 06:30:00+00', 1800000),
(auth.uid(), 'Sprint Planning', 'Work', '2024-06-21 09:00:00+00', 5400000),
(auth.uid(), 'Swimming', 'Exercise', '2024-06-22 07:00:00+00', 3000000),
(auth.uid(), 'Backend Optimization', 'Work', '2024-06-23 12:00:00+00', 10800000),
(auth.uid(), 'Photography Walk', 'Personal', '2024-06-24 16:00:00+00', 7200000),
(auth.uid(), 'Security Audit', 'Work', '2024-06-25 14:30:00+00', 9000000),
(auth.uid(), 'Journaling', 'Personal', '2024-06-26 21:00:00+00', 1200000),

-- July timers
(auth.uid(), 'Machine Learning Study', 'Study', '2024-07-01 10:00:00+00', 7200000),
(auth.uid(), 'Cycling', 'Exercise', '2024-07-02 17:00:00+00', 3600000),
(auth.uid(), 'Product Planning', 'Work', '2024-07-03 11:00:00+00', 6300000),
(auth.uid(), 'Language Exchange', 'Study', '2024-07-04 19:00:00+00', 3600000),
(auth.uid(), 'Deployment Pipeline', 'Work', '2024-07-05 13:00:00+00', 8100000),
(auth.uid(), 'Rock Climbing', 'Exercise', '2024-07-06 15:00:00+00', 5400000),
(auth.uid(), 'Blog Writing', 'Personal', '2024-07-07 20:00:00+00', 4500000),
(auth.uid(), 'Algorithm Practice', 'Study', '2024-07-08 14:00:00+00', 5400000),
(auth.uid(), 'Containerization', 'Work', '2024-07-09 10:30:00+00', 7200000),
(auth.uid(), 'Hiking Prep', 'Exercise', '2024-07-10 08:00:00+00', 1800000),
(auth.uid(), 'Portfolio Update', 'Personal', '2024-07-11 16:30:00+00', 3600000);

-- Insert timer sessions for each timer with multiple sessions
INSERT INTO public.timer_sessions (timer_id, user_id, start_time, end_time, duration_ms)
SELECT 
  t.id,
  t.user_id,
  t.created_at + (INTERVAL '1 hour' * generate_series(0, LEAST(10, EXTRACT(day FROM NOW() - t.created_at)::integer))) as start_time,
  t.created_at + (INTERVAL '1 hour' * generate_series(0, LEAST(10, EXTRACT(day FROM NOW() - t.created_at)::integer))) + 
    (INTERVAL '1 millisecond' * (random() * t.elapsed_time + 300000)) as end_time,
  (random() * t.elapsed_time + 300000)::bigint as duration_ms
FROM public.timers t
WHERE t.name IN (
  'Morning Workout', 'Email Processing', 'React Development', 'Spanish Lessons', 
  'Meditation Session', 'Client Meeting Prep', 'Yoga Practice', 'Database Design',
  'Reading Fiction', 'Code Review', 'Piano Practice', 'Bug Fixing',
  'Evening Run', 'API Documentation', 'Cooking Practice', 'UI Design',
  'French Study', 'Team Standup', 'Strength Training', 'Feature Development',
  'Podcast Recording', 'Testing & QA', 'Guitar Practice', 'Research Task',
  'Morning Pages', 'Sprint Planning', 'Swimming', 'Backend Optimization',
  'Photography Walk', 'Security Audit', 'Journaling', 'Machine Learning Study',
  'Cycling', 'Product Planning', 'Language Exchange', 'Deployment Pipeline',
  'Rock Climbing', 'Blog Writing', 'Algorithm Practice', 'Containerization',
  'Hiking Prep', 'Portfolio Update'
)
AND t.user_id = auth.uid();