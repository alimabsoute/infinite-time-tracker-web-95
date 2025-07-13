
import { isWithinInterval } from 'date-fns';
import { TimerSessionWithTimer } from "../../../../types";

export const filterSessionsInDateRange = (
  sessions: TimerSessionWithTimer[],
  startDate: Date,
  endDate: Date
): TimerSessionWithTimer[] => {
  console.log('🔍 SessionFilter - Filtering sessions:', {
    totalSessions: sessions.length,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });

  if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
    console.log('🔍 SessionFilter - No valid sessions data');
    return [];
  }

  if (!startDate || !endDate || !(startDate instanceof Date) || !(endDate instanceof Date)) {
    console.log('🔍 SessionFilter - Invalid date range');
    return [];
  }

  const rangeInterval = { start: startDate, end: endDate };
  const filteredSessions = sessions.filter(session => {
    if (!session.start_time) return false;
    
    try {
      const sessionDate = new Date(session.start_time);
      const isInRange = isWithinInterval(sessionDate, rangeInterval);
      const hasValidDuration = session.duration_ms && session.duration_ms > 0;
      
      return isInRange && hasValidDuration;
    } catch (error) {
      console.warn('🔍 SessionFilter - Invalid session date:', session.start_time);
      return false;
    }
  });

  console.log('🔍 SessionFilter - Filtered sessions:', {
    originalCount: sessions.length,
    filteredCount: filteredSessions.length,
    withValidDuration: filteredSessions.filter(s => s.duration_ms && s.duration_ms > 0).length
  });

  return filteredSessions;
};
