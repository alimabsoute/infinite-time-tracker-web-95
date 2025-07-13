
import { useMemo } from 'react';
import { TimerSessionWithTimer } from '../../../types';

export interface BubbleData {
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
  timerId: string;
  name: string;
  totalHours: string;
  avgMinutes: string;
  avgSessionTime: number;
  sessions: TimerSessionWithTimer[];
  x: number;
  y: number;
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
    try {
      console.log('🔍 BubbleDataProcessor - Processing sessions:', {
        totalSessions: sessions?.length || 0,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      });

      // Defensive validation
      if (!Array.isArray(sessions) || sessions.length === 0) {
        console.log('🔍 BubbleDataProcessor - No sessions to process');
        return [];
      }

      if (!startDate || !endDate || !(startDate instanceof Date) || !(endDate instanceof Date)) {
        console.warn('🔍 BubbleDataProcessor - Invalid date range');
        return [];
      }

      // Filter sessions with enhanced validation
      const filteredSessions = sessions.filter(session => {
        try {
          // Basic session validation
          if (!session || typeof session !== 'object') return false;
          
          // Timer validation
          if (!session.timers || !session.timer_id) return false;
          
          // Duration validation
          if (!session.duration_ms || typeof session.duration_ms !== 'number' || session.duration_ms <= 0) {
            return false;
          }
          
          // Date validation
          if (!session.start_time) return false;
          
          const sessionDate = new Date(session.start_time);
          if (isNaN(sessionDate.getTime())) return false;
          
          return sessionDate >= startDate && sessionDate <= endDate;
        } catch (error) {
          console.warn('🔍 BubbleDataProcessor - Session validation error:', error, session);
          return false;
        }
      });

      console.log('🔍 BubbleDataProcessor - Filtered sessions:', {
        original: sessions.length,
        filtered: filteredSessions.length
      });

      if (filteredSessions.length === 0) {
        return [];
      }

      // Group by timer with defensive programming
      const timerGroups: { [key: string]: TimerSessionWithTimer[] } = {};
      
      filteredSessions.forEach(session => {
        try {
          const timerId = session.timer_id;
          if (!timerId || typeof timerId !== 'string') return;
          
          if (!timerGroups[timerId]) {
            timerGroups[timerId] = [];
          }
          timerGroups[timerId].push(session);
        } catch (error) {
          console.warn('🔍 BubbleDataProcessor - Grouping error:', error);
        }
      });

      const timerGroupEntries = Object.entries(timerGroups);
      if (timerGroupEntries.length === 0) {
        return [];
      }

      // Calculate statistics with error handling
      const timerStats = timerGroupEntries.map(([timerId, timerSessions]) => {
        try {
          const validSessions = timerSessions.filter(s => s.duration_ms && s.duration_ms > 0);
          
          if (validSessions.length === 0) {
            return null;
          }

          const totalTime = validSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
          const sessionCount = validSessions.length;
          const avgSessionTime = totalTime / sessionCount;
          const timer = validSessions[0]?.timers;
          const isRunning = timerSessions.some(s => 
            typeof s.id === 'string' && s.id.startsWith('virtual-')
          );
          
          return {
            timerId,
            name: timer?.name || 'Unknown Timer',
            category: timer?.category || 'Uncategorized', 
            totalTime: Math.max(0, totalTime),
            sessionCount: Math.max(1, sessionCount),
            avgSessionTime: Math.max(1000, avgSessionTime), // Minimum 1 second
            sessions: validSessions,
            isRunning: Boolean(isRunning),
            creationDate: timer?.created_at ? new Date(timer.created_at) : new Date()
          };
        } catch (error) {
          console.warn('🔍 BubbleDataProcessor - Timer stats calculation error:', error);
          return null;
        }
      }).filter(Boolean);

      if (timerStats.length === 0) {
        return [];
      }

      // Calculate scaling factors safely
      const totalTimes = timerStats.map(t => t!.totalTime).filter(t => t > 0);
      const sessionCounts = timerStats.map(t => t!.sessionCount).filter(t => t > 0);
      const avgTimes = timerStats.map(t => t!.avgSessionTime).filter(t => t > 0);

      const maxTotalTime = Math.max(...totalTimes, 1);
      const maxSessionCount = Math.max(...sessionCounts, 1);
      const maxAvgTime = Math.max(...avgTimes, 1);

      // Generate bubble data with safe positioning
      const bubbles: BubbleData[] = timerStats.map((timer, index) => {
        try {
          if (!timer) return null;

          // Safe color generation
          const hue = (index * 137.508) % 360; // Golden angle
          const saturation = 60 + (index * 20) % 40;
          const lightness = 45 + (index * 10) % 20;
          const color = timer.isRunning ? '#22c55e' : `hsl(${hue}, ${saturation}%, ${lightness}%)`;
          
          // Safe positioning with bounds checking
          const timeRatio = Math.min(1, Math.max(0, timer.totalTime / maxTotalTime));
          const sessionRatio = Math.min(1, Math.max(0, timer.sessionCount / maxSessionCount));
          const avgRatio = Math.min(1, Math.max(0, timer.avgSessionTime / maxAvgTime));
          
          // Distribute bubbles in 3D space with safe bounds
          const x = (timeRatio * 16) - 8; // -8 to 8
          const y = (avgRatio * 12) - 6;  // -6 to 6
          const z = (sessionRatio * 8) - 4; // -4 to 4
          
          // Safe size calculation
          const baseSize = Math.max(0.3, Math.min(2.0, Math.log(timer.sessionCount + 1) * 0.5 + 0.2));
          const timeBonus = Math.min(0.8, timer.totalTime / (1000 * 60 * 60 * 10)); // Max 10 hours
          const size = Math.max(0.3, Math.min(3.0, baseSize + timeBonus));
          
          // Safe time formatting
          const totalHours = (timer.totalTime / (1000 * 60 * 60));
          const avgMinutes = (timer.avgSessionTime / (1000 * 60));
          
          return {
            id: `${timer.timerId}-${index}`,
            position: [
              Math.max(-10, Math.min(10, x)),
              Math.max(-8, Math.min(8, y)),
              Math.max(-6, Math.min(6, z))
            ] as [number, number, number],
            size: size,
            color: color,
            timerName: timer.name,
            totalTime: timer.totalTime,
            sessionCount: timer.sessionCount,
            creationDate: timer.creationDate,
            category: timer.category,
            isRunning: timer.isRunning,
            timerId: timer.timerId,
            name: timer.name,
            totalHours: totalHours.toFixed(1),
            avgMinutes: avgMinutes.toFixed(1),
            avgSessionTime: timer.avgSessionTime,
            sessions: timer.sessions,
            x: totalHours,
            y: avgMinutes
          };
        } catch (error) {
          console.warn('🔍 BubbleDataProcessor - Bubble generation error:', error);
          return null;
        }
      }).filter((bubble): bubble is BubbleData => bubble !== null);

      console.log('🔍 BubbleDataProcessor - Generated bubbles:', {
        count: bubbles.length,
        sample: bubbles[0] ? {
          name: bubbles[0].timerName,
          position: bubbles[0].position,
          size: bubbles[0].size
        } : null
      });

      return bubbles;

    } catch (error) {
      console.error('🔍 BubbleDataProcessor - Critical error:', error);
      onError?.(error as Error);
      return [];
    }
  }, [sessions, startDate, endDate, onError]);
};

export default useBubbleDataProcessor;
