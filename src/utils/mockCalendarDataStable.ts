// Stable mock data generator to prevent constant regeneration
import { Timer, TimerSessionWithTimer } from '../types';

// Cache to prevent constant regeneration
const mockDataCache = new Map<string, TimerSessionWithTimer[]>();

export const generateStableMockSessionsForCalendar = (timers: Timer[]): TimerSessionWithTimer[] => {
  // Create a stable cache key based on timer count and IDs
  const cacheKey = `${timers.length}-${timers.map(t => t.id).sort().join(',')}`;
  
  if (mockDataCache.has(cacheKey)) {
    return mockDataCache.get(cacheKey)!;
  }

  const sessions: TimerSessionWithTimer[] = [];
  const now = new Date();
  
  // Use a stable seed for consistent data generation
  let seed = 12345;
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  // Generate sessions for the past 30 days
  for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
    const sessionDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // 70% chance of having sessions on any given day
    if (seededRandom() > 0.3) {
      const sessionsCount = Math.floor(seededRandom() * 5) + 1; // 1-5 sessions per day
      
      for (let i = 0; i < sessionsCount; i++) {
        const timer = timers[Math.floor(seededRandom() * timers.length)];
        if (!timer) continue;
        
        const startTime = new Date(sessionDate);
        startTime.setHours(Math.floor(seededRandom() * 16) + 6); // 6 AM to 10 PM
        startTime.setMinutes(Math.floor(seededRandom() * 60));
        
        const duration = Math.floor(seededRandom() * 3600000) + 300000; // 5 minutes to 1 hour
        const endTime = new Date(startTime.getTime() + duration);
        
        sessions.push({
          id: `stable-mock-session-${daysAgo}-${i}`,
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
  
  const sortedSessions = sessions.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  
  // Cache the result
  mockDataCache.set(cacheKey, sortedSessions);
  
  
  return sortedSessions;
};

// Clear cache when needed (e.g., when timers change significantly)
export const clearMockDataCache = () => {
  mockDataCache.clear();
};