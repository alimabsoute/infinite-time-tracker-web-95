
import { Timer, TimerSession, TimerSessionWithTimer } from "../../types";
import { isSameDay, parseISO, isValid, format } from "date-fns";

// Format time for display
export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// --- ENHANCED SESSION-BASED FUNCTIONS WITH DEBUGGING ---

// Get all sessions that occurred on a specific date with enhanced debugging
export const getSessionsForDate = (date: Date, sessions: TimerSessionWithTimer[]): TimerSessionWithTimer[] => {
  if (!date || !sessions) {
    console.log('⚠️ getSessionsForDate: Missing date or sessions', { date, sessionsCount: sessions?.length || 0 });
    return [];
  }

  const targetDateStr = format(date, 'yyyy-MM-dd');
  console.log(`🔍 getSessionsForDate: Looking for sessions on ${targetDateStr}`);

  const filteredSessions = sessions.filter(session => {
    if (!session.start_time) {
      console.log('⚠️ Session missing start_time:', session.id);
      return false;
    }

    try {
      const sessionDate = parseISO(session.start_time);
      
      if (!isValid(sessionDate)) {
        console.log('⚠️ Invalid session date:', session.start_time, 'for session:', session.id);
        return false;
      }

      const sessionDateStr = format(sessionDate, 'yyyy-MM-dd');
      const matches = sessionDateStr === targetDateStr;
      
      if (matches) {
        console.log(`✅ Found matching session:`, {
          id: session.id,
          start_time: session.start_time,
          sessionDateStr,
          targetDateStr,
          duration_ms: session.duration_ms,
          timer_name: session.timers?.name
        });
      }
      
      return matches;
    } catch (error) {
      console.log('❌ Error parsing session date:', session.start_time, error);
      return false;
    }
  });

  console.log(`🔍 getSessionsForDate result for ${targetDateStr}:`, {
    totalSessions: sessions.length,
    filteredSessions: filteredSessions.length,
    sessions: filteredSessions.map(s => ({
      id: s.id,
      start_time: s.start_time,
      duration_ms: s.duration_ms,
      timer_name: s.timers?.name
    }))
  });

  return filteredSessions;
};

// Calculate total time tracked for a specific date from sessions
export const getTotalTimeForDate = (date: Date, sessions: TimerSessionWithTimer[]): number => {
  const daySessions = getSessionsForDate(date, sessions);
  const totalTime = daySessions.reduce((total, session) => total + (session.duration_ms || 0), 0);
  
  console.log(`🔍 getTotalTimeForDate for ${format(date, 'yyyy-MM-dd')}:`, {
    sessionsCount: daySessions.length,
    totalTimeMs: totalTime,
    totalTimeHours: totalTime / 3600000
  });
  
  return totalTime;
};

// Generate color intensity based on activity level from sessions
export const getHeatMapColor = (date: Date, sessions: TimerSessionWithTimer[]): string => {
  const totalTime = getTotalTimeForDate(date, sessions);
  
  if (totalTime === 0) return "bg-transparent";
  if (totalTime < 1800000) return "bg-blue-500/20"; // Less than 30 mins
  if (totalTime < 3600000) return "bg-blue-500/40"; // Less than 1 hour
  if (totalTime < 7200000) return "bg-blue-500/60"; // Less than 2 hours
  if (totalTime < 14400000) return "bg-blue-500/80"; // Less than 4 hours
  return "bg-blue-500"; // More than 4 hours
};

// --- EXISTING TIMER-BASED FUNCTIONS (mostly for deadlines) ---

// Get timers that have deadlines on a specific date
export const getTimersWithDeadlinesForDate = (date: Date | undefined, timers: Timer[]): Timer[] => {
  if (!date) return [];
  
  // Create target date string in YYYY-MM-DD format for comparison
  const targetDateStr = date.getFullYear() + '-' + 
    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
    String(date.getDate()).padStart(2, '0');
  
  const result = timers.filter(timer => {
    if (!timer.deadline) return false;
    
    // Convert deadline to local date string for comparison
    const deadlineDate = new Date(timer.deadline);
    const deadlineDateStr = deadlineDate.getFullYear() + '-' + 
      String(deadlineDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(deadlineDate.getDate()).padStart(2, '0');
    
    const isMatch = deadlineDateStr === targetDateStr;
    
    return isMatch;
  });
  
  console.log(`getTimersWithDeadlinesForDate - ${targetDateStr}:`, {
    targetDateStr,
    inputTimers: timers.length,
    timersWithDeadlines: timers.filter(t => t.deadline).length,
    matchingDeadlines: result.length,
    matches: result.map(t => ({ name: t.name, deadline: t.deadline }))
  });
  
  return result;
};

// DEPRECATED, but kept for reference if needed elsewhere.
export const getTimersForDate = (date: Date | undefined, timers: Timer[]): Timer[] => {
  if (!date) return [];
  
  // Create normalized date strings for comparison (YYYY-MM-DD format)
  const targetDateStr = date.getFullYear() + '-' + 
    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
    String(date.getDate()).padStart(2, '0');
  
  const result = timers.filter(timer => {
    const timerDate = new Date(timer.createdAt);
    const timerDateStr = timerDate.getFullYear() + '-' + 
      String(timerDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(timerDate.getDate()).padStart(2, '0');
    
    const isMatch = timerDateStr === targetDateStr;
    return isMatch;
  });
  
  console.log(`getTimersForDate - ${targetDateStr}:`, {
    targetDateStr,
    totalTimers: timers.length,
    matchingTimers: result.length,
    matches: result.map(t => ({ name: t.name, createdAt: new Date(t.createdAt).toISOString() }))
  });
  
  return result;
};

// Get all timers relevant to a specific date (deadline timers)
// Activity is now handled by sessions separately.
export const getAllTimersForDate = (date: Date | undefined, timers: Timer[]): Timer[] => {
  if (!date) return [];
  
  // This function now primarily serves to find deadlines for a date.
  // Timer *creation* on a date is no longer the metric for activity.
  const deadlineTimers = getTimersWithDeadlinesForDate(date, timers);
  
  return deadlineTimers;
};
