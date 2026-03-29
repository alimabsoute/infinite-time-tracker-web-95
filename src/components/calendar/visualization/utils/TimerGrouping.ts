
import { TimerSessionWithTimer } from "../../../../types";

export interface TimerGroup {
  sessions: TimerSessionWithTimer[];
  totalTime: number;
  category: string;
  createdAt: Date;
  timerId: string;
  isRunning: boolean;
}

export const groupSessionsByTimer = (
  sessions: TimerSessionWithTimer[],
  onError?: (error: Error) => void
): Record<string, TimerGroup> => {

  const timerGroups: Record<string, TimerGroup> = {};

  sessions.forEach(session => {
    try {
      // Extract timer name with proper fallback
      let timerName: string | undefined;
      let category = 'Uncategorized';
      
      if (session.timers?.name) {
        timerName = session.timers.name;
        category = session.timers.category || 'Uncategorized';
      }
      
      if (!timerName || typeof timerName !== 'string' || timerName.trim() === '') {
        console.warn('TimerGrouping - Skipping session with invalid timer name:', session.id);
        return;
      }
      
      // Initialize timer group
      if (!timerGroups[timerName]) {
        timerGroups[timerName] = {
          sessions: [],
          totalTime: 0,
          category,
          createdAt: new Date(session.start_time),
          timerId: session.timer_id || session.id,
          isRunning: false
        };
      }
      
      // Check if this is a running timer (virtual session)
      const isRunningSession = session.id.startsWith('virtual-');
      if (isRunningSession) {
        timerGroups[timerName].isRunning = true;
      }
      
      // Add session and calculate duration
      timerGroups[timerName].sessions.push(session);
      
      let sessionDuration = 0;
      if (session.duration_ms && typeof session.duration_ms === 'number' && session.duration_ms > 0) {
        sessionDuration = session.duration_ms;
      } else if (session.end_time && session.start_time) {
        const startTime = new Date(session.start_time).getTime();
        const endTime = new Date(session.end_time).getTime();
        if (endTime > startTime) {
          sessionDuration = endTime - startTime;
        }
      }
      
      timerGroups[timerName].totalTime += sessionDuration;

    } catch (error) {
      console.error('TimerGrouping - Error processing session:', error);
      onError?.(error as Error);
    }
  });


  return timerGroups;
};
