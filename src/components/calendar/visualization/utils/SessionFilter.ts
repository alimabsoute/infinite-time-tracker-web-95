
import { isWithinInterval } from 'date-fns';
import { TimerSessionWithTimer } from "../../../../types";

export const filterSessionsInDateRange = (
  sessions: TimerSessionWithTimer[],
  startDate: Date,
  endDate: Date
): TimerSessionWithTimer[] => {
  if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
    return [];
  }

  if (!startDate || !endDate || !(startDate instanceof Date) || !(endDate instanceof Date)) {
    return [];
  }

  const rangeInterval = { start: startDate, end: endDate };
  const filteredSessions = sessions.filter(session => {
    if (!session.start_time) return false;
    
    try {
      const sessionDate = new Date(session.start_time);
      const isInRange = isWithinInterval(sessionDate, rangeInterval);
      // Include running timers (virtual sessions) even if duration is small
      const hasValidDuration = session.duration_ms && session.duration_ms > 0;
      const isRunningTimer = session.id.startsWith('virtual-') && session.duration_ms && session.duration_ms >= 0;
      
      return isInRange && (hasValidDuration || isRunningTimer);
    } catch (error) {
      console.warn('SessionFilter - Invalid session date:', session.start_time);
      return false;
    }
  });


  return filteredSessions;
};
