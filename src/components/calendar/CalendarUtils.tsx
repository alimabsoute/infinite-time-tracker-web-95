import { Timer, TimerSessionWithTimer } from "../../types";
import { parseISO, isValid, format } from "date-fns";

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

// Get all sessions that occurred on a specific date
export const getSessionsForDate = (date: Date, sessions: TimerSessionWithTimer[]): TimerSessionWithTimer[] => {
  if (!date || !sessions) {
    return [];
  }

  const targetDateStr = format(date, 'yyyy-MM-dd');

  const filteredSessions = sessions.filter(session => {
    if (!session.start_time) {
      return false;
    }

    try {
      const sessionDate = parseISO(session.start_time);
      
      if (!isValid(sessionDate)) {
        return false;
      }

      const sessionDateStr = format(sessionDate, 'yyyy-MM-dd');
      return sessionDateStr === targetDateStr;
    } catch (error) {
      console.error('Error parsing session date:', session.start_time, error);
      return false;
    }
  });

  return filteredSessions;
};

// Calculate total time tracked for a specific date from sessions
export const getTotalTimeForDate = (date: Date, sessions: TimerSessionWithTimer[]): number => {
  const daySessions = getSessionsForDate(date, sessions);
  return daySessions.reduce((total, session) => total + (session.duration_ms || 0), 0);
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

// Get timers that have deadlines on a specific date
export const getTimersWithDeadlinesForDate = (date: Date | undefined, timers: Timer[]): Timer[] => {
  if (!date) return [];
  
  const targetDateStr = format(date, 'yyyy-MM-dd');
  
  return timers.filter(timer => {
    if (!timer.deadline) return false;
    
    try {
      const deadlineDate = new Date(timer.deadline);
      if (!isValid(deadlineDate)) return false;
      
      const deadlineDateStr = format(deadlineDate, 'yyyy-MM-dd');
      return deadlineDateStr === targetDateStr;
    } catch (error) {
      console.error('Error parsing deadline date:', timer.deadline, error);
      return false;
    }
  });
};

// Format deadline display information
export const formatDeadlineDisplay = (timer: Timer): string => {
  return timer.name.length > 8 ? `${timer.name.substring(0, 8)}...` : timer.name;
};

// Get deadline urgency level based on priority
export const getDeadlineUrgencyLevel = (timers: Timer[]): 'high' | 'medium' | 'low' | 'none' => {
  if (timers.length === 0) return 'none';
  
  const priorities = timers.map(t => t.priority || 0);
  const highestPriority = Math.max(...priorities);
  
  if (highestPriority >= 4) return 'high';
  if (highestPriority >= 3) return 'medium';
  return 'low';
};

// Get deadline color based on priority level
export const getDeadlinePriorityColor = (priority?: number): string => {
  switch (priority) {
    case 5:
    case 4:
      return 'bg-red-500'; // High priority
    case 3:
      return 'bg-orange-500'; // Medium-high priority
    case 2:
      return 'bg-yellow-500'; // Medium priority
    case 1:
      return 'bg-green-500'; // Low priority
    default:
      return 'bg-gray-500'; // No priority
  }
};

// Get timers created on a specific date
export const getTimersForDate = (date: Date | undefined, timers: Timer[]): Timer[] => {
  if (!date) return [];
  
  const targetDateStr = date.getFullYear() + '-' + 
    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
    String(date.getDate()).padStart(2, '0');
  
  return timers.filter(timer => {
    const timerDate = new Date(timer.createdAt);
    const timerDateStr = timerDate.getFullYear() + '-' + 
      String(timerDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(timerDate.getDate()).padStart(2, '0');
    
    return timerDateStr === targetDateStr;
  });
};

// Get all timers relevant to a specific date (deadline timers)
export const getAllTimersForDate = (date: Date | undefined, timers: Timer[]): Timer[] => {
  if (!date) return [];
  return getTimersWithDeadlinesForDate(date, timers);
};

export const getSessionsForDateRange = (
  startDate: Date,
  endDate: Date,
  sessions: TimerSessionWithTimer[]
): TimerSessionWithTimer[] => {
  return sessions.filter(session => {
    if (!session.start_time) return false;
    
    const sessionDate = new Date(session.start_time);
    return sessionDate >= startDate && sessionDate <= endDate;
  });
};
