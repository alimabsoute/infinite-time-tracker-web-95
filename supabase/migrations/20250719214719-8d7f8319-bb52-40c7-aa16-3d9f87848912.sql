-- Clear all timer and goal related data to start fresh
-- This will remove all timers, sessions, goals, milestones, and progress

-- Delete all timer sessions first (due to potential references)
DELETE FROM timer_sessions;

-- Delete all timers
DELETE FROM timers;

-- Delete all goal progress entries
DELETE FROM goal_progress;

-- Delete all goal milestones  
DELETE FROM goal_milestones;

-- Delete all goals
DELETE FROM goals;

-- Note: Keeping profiles and subscribers tables intact to preserve user account data