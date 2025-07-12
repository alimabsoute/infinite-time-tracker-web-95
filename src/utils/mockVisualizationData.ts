
import { subDays, addHours, addMinutes } from 'date-fns';
import { TimerSessionWithTimer } from '../types';

const CATEGORIES = ['Work', 'Personal', 'Study', 'Exercise', 'Health', 'Learning'];
const TIMER_NAMES = [
  'Project Alpha', 'Morning Routine', 'Reading', 'Gym Workout', 'Meditation',
  'Code Review', 'Meal Prep', 'Research', 'Cardio', 'Sleep Tracking',
  'Meeting Prep', 'Journaling', 'Tutorial', 'Strength Training', 'Breathing',
  'Bug Fixes', 'Cleaning', 'Learning JS', 'Yoga', 'Vitamins',
  'Design Work', 'Groceries', 'Math Study', 'Running', 'Water Intake'
];

export const generateMockVisualizationData = (): TimerSessionWithTimer[] => {
  const sessions: TimerSessionWithTimer[] = [];
  const baseDate = subDays(new Date(), 5); // Start 5 days ago for better spread

  // Generate 50 sessions across 10 days
  for (let i = 0; i < 50; i++) {
    const dayOffset = Math.floor(i / 5); // 5 sessions per day roughly
    const sessionDate = addHours(addMinutes(baseDate, dayOffset * 24 * 60), Math.random() * 16 + 6); // Between 6 AM and 10 PM
    
    const timerName = TIMER_NAMES[Math.floor(Math.random() * TIMER_NAMES.length)];
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    
    // Generate realistic session durations (5 minutes to 4 hours)
    const durationMs = Math.floor(Math.random() * (4 * 60 * 60 * 1000 - 5 * 60 * 1000)) + 5 * 60 * 1000;
    const endTime = new Date(sessionDate.getTime() + durationMs);
    
    const session: TimerSessionWithTimer = {
      id: `mock-session-${i}`,
      timer_id: `mock-timer-${i % 25}`, // 25 unique timers
      user_id: 'mock-user',
      start_time: sessionDate.toISOString(),
      end_time: endTime.toISOString(),
      duration_ms: durationMs,
      created_at: sessionDate.toISOString(),
      timers: {
        id: `mock-timer-${i % 25}`,
        name: timerName,
        category
      }
    };
    
    sessions.push(session);
  }
  
  console.log('🔍 Generated mock visualization data:', {
    totalSessions: sessions.length,
    uniqueTimers: new Set(sessions.map(s => s.timer_id)).size,
    categories: [...new Set(sessions.map(s => s.timers?.category))],
    dateRange: {
      start: sessions[0]?.start_time,
      end: sessions[sessions.length - 1]?.start_time
    }
  });
  
  return sessions;
};
