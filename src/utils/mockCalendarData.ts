// Mock data generator for calendar testing
import { Timer, TimerSessionWithTimer } from '../types';

export const generateMockTimersForCalendar = (): Timer[] => {
  const categories = ['Work', 'Personal', 'Study', 'Exercise', 'Health', 'Learning'];
  const timerNames = [
    'Focus Session', 'Code Review', 'Meeting Prep', 'Deep Work',
    'Exercise', 'Reading', 'Project Planning', 'Learning', 
    'Writing', 'Research', 'Break Time', 'Admin Tasks'
  ];

  return Array.from({ length: 12 }, (_, i) => ({
    id: `mock-timer-${i + 1}`,
    name: timerNames[i] || `Timer ${i + 1}`,
    category: categories[i % categories.length],
    elapsedTime: Math.floor(Math.random() * 7200000), // 0-2 hours
    isRunning: false,
    createdAt: new Date(),
    deadline: i % 4 === 0 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
    priority: Math.floor(Math.random() * 5) + 1 // 1-5
  }));
};

export const generateMockSessionsForCalendar = (timers: Timer[]): TimerSessionWithTimer[] => {
  const sessions: TimerSessionWithTimer[] = [];
  const now = new Date();
  
  // Generate sessions for the past 30 days
  for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
    const sessionDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // 70% chance of having sessions on any given day
    if (Math.random() > 0.3) {
      const sessionsCount = Math.floor(Math.random() * 5) + 1; // 1-5 sessions per day
      
      for (let i = 0; i < sessionsCount; i++) {
        const timer = timers[Math.floor(Math.random() * timers.length)];
        const startTime = new Date(sessionDate);
        startTime.setHours(Math.floor(Math.random() * 16) + 6); // 6 AM to 10 PM
        startTime.setMinutes(Math.floor(Math.random() * 60));
        
        const duration = Math.floor(Math.random() * 3600000) + 300000; // 5 minutes to 1 hour
        const endTime = new Date(startTime.getTime() + duration);
        
        sessions.push({
          id: `mock-session-${daysAgo}-${i}`,
          timer_id: timer.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration_ms: duration,
          user_id: 'mock-user',
          timers: {
            id: timer.id,
            name: timer.name,
            category: timer.category || 'Uncategorized'
          }
        });
      }
    }
  }
  
  console.log('🎯 Generated mock calendar data:', {
    timers: timers.length,
    sessions: sessions.length,
    daysWithActivity: sessions.reduce((days, session) => {
      const day = new Date(session.start_time).toDateString();
      return days.add(day);
    }, new Set()).size
  });
  
  return sessions.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
};