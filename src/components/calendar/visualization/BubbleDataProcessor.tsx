
import { useMemo } from 'react';
import { differenceInDays, isWithinInterval } from 'date-fns';
import { TimerSessionWithTimer } from "../../../types";

interface BubbleData {
  id: string;
  position: [number, number, number];
  size: number;
  color: string;
  timerName: string;
  totalTime: number;
  sessionCount: number;
  creationDate: Date;
  category: string;
  isRunning: boolean;
}

interface BubbleDataProcessorProps {
  sessions: TimerSessionWithTimer[];
  startDate: Date;
  endDate: Date;
  onError?: (error: Error) => void;
}

export const useBubbleDataProcessor = ({
  sessions,
  startDate,
  endDate,
  onError
}: BubbleDataProcessorProps): BubbleData[] => {
  return useMemo(() => {
    console.log('🔍 BubbleDataProcessor - Processing sessions:', {
      totalSessions: sessions.length,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      sampleSessions: sessions.slice(0, 3).map(s => ({
        id: s.id,
        timer_id: s.timer_id,
        duration_ms: s.duration_ms,
        timer_name: s.timers?.name,
        isVirtual: s.id.startsWith('virtual-')
      }))
    });
    
    try {
      if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
        console.log('🔍 BubbleDataProcessor - No valid sessions data');
        return [];
      }

      if (!startDate || !endDate || !(startDate instanceof Date) || !(endDate instanceof Date)) {
        console.log('🔍 BubbleDataProcessor - Invalid date range');
        return [];
      }

      // Filter sessions within the date range
      const rangeInterval = { start: startDate, end: endDate };
      const filteredSessions = sessions.filter(session => {
        if (!session.start_time) return false;
        
        try {
          const sessionDate = new Date(session.start_time);
          const isInRange = isWithinInterval(sessionDate, rangeInterval);
          const hasValidDuration = session.duration_ms && session.duration_ms > 0;
          
          return isInRange && hasValidDuration;
        } catch (error) {
          console.warn('🔍 BubbleDataProcessor - Invalid session date:', session.start_time);
          return false;
        }
      });

      console.log('🔍 BubbleDataProcessor - Filtered sessions:', {
        originalCount: sessions.length,
        filteredCount: filteredSessions.length,
        withValidDuration: filteredSessions.filter(s => s.duration_ms && s.duration_ms > 0).length
      });

      // Group sessions by timer with enhanced validation
      const timerGroups: Record<string, any> = {};

      filteredSessions.forEach(session => {
        try {
          // Extract timer name with proper fallback
          let timerName: string | undefined;
          let category = 'Uncategorized';
          
          if (session.timers?.name) {
            timerName = session.timers.name;
            category = session.timers.category || 'Uncategorized';
          }
          
          if (!timerName || typeof timerName !== 'string' || timerName.trim() === '') {
            console.warn('🔍 BubbleDataProcessor - Skipping session with invalid timer name:', session.id);
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
          
          console.log('🔍 BubbleDataProcessor - Processed session:', {
            sessionId: session.id,
            timerName,
            sessionDuration,
            isRunning: isRunningSession,
            totalTimeNow: timerGroups[timerName].totalTime
          });
        } catch (error) {
          console.error('🔍 BubbleDataProcessor - Error processing session:', error);
          onError?.(error as Error);
        }
      });

      console.log('🔍 BubbleDataProcessor - Timer groups created:', {
        groupCount: Object.keys(timerGroups).length,
        groups: Object.entries(timerGroups).map(([name, data]) => ({
          timerName: name,
          sessionCount: data.sessions.length,
          totalTime: data.totalTime,
          isRunning: data.isRunning
        }))
      });

      // Convert to bubble data
      const bubbleData: BubbleData[] = Object.entries(timerGroups).map(([timerName, data], index) => {
        try {
          // Position calculation based on date range
          const totalDays = differenceInDays(endDate, startDate) || 1;
          const daysFromStart = differenceInDays(data.createdAt, startDate);
          const xPosition = Math.max(-8, Math.min(8, (daysFromStart / totalDays) * 16 - 8));
          const yPosition = Math.random() * 6 - 3;
          const zPosition = Math.random() * 4 - 2;
          
          // Size calculation
          const timeInHours = Math.max(0, data.totalTime / 3600000);
          const size = Math.max(0.3, Math.min(2, Math.log(timeInHours + 1) * 0.8));
          
          // Validate values
          if (!isFinite(xPosition) || !isFinite(yPosition) || !isFinite(zPosition) || !isFinite(size)) {
            console.warn('🔍 BubbleDataProcessor - Invalid values for timer:', timerName);
            return null;
          }
          
          // Category colors with running timer override
          const colors: Record<string, string> = {
            'Work': '#3b82f6',
            'Personal': '#10b981',
            'Study': '#f59e0b',
            'Exercise': '#ef4444',
            'Health': '#8b5cf6',
            'Learning': '#06b6d4',
            'Uncategorized': '#6b7280'
          };
          
          let color = colors[data.category] || colors.Uncategorized;
          
          // Override color for running timers
          if (data.isRunning) {
            color = '#22c55e'; // Green for running timers
          }
          
          const bubble: BubbleData = {
            id: `${timerName}-${index}`,
            position: [xPosition, yPosition, zPosition] as [number, number, number],
            size,
            color,
            timerName,
            totalTime: data.totalTime,
            sessionCount: data.sessions.length,
            creationDate: data.createdAt,
            category: data.category,
            isRunning: data.isRunning
          };
          
          console.log('🔍 BubbleDataProcessor - Created bubble:', {
            timerName: bubble.timerName,
            totalTime: bubble.totalTime,
            sessionCount: bubble.sessionCount,
            isRunning: bubble.isRunning,
            color: bubble.color
          });
          
          return bubble;
        } catch (error) {
          console.error('🔍 BubbleDataProcessor - Error creating bubble for timer:', timerName, error);
          onError?.(error as Error);
          return null;
        }
      }).filter((bubble): bubble is BubbleData => bubble !== null);

      console.log('🔍 BubbleDataProcessor - Generated bubbles:', {
        total: bubbleData.length,
        running: bubbleData.filter(b => b.isRunning).length,
        stopped: bubbleData.filter(b => !b.isRunning).length
      });
      
      return bubbleData;
    } catch (error) {
      console.error('🔍 BubbleDataProcessor - Critical error:', error);
      onError?.(error as Error);
      return [];
    }
  }, [sessions, startDate, endDate, onError]);
};

export type { BubbleData };
