import { useMemo } from 'react';
import { TimerSessionWithTimer } from '../../../types';

export interface BubbleDataPoint {
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

export interface BubbleData extends BubbleDataPoint {}

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
    const startTime = performance.now();
    console.log('🔍 BubbleDataProcessor - Starting enhanced processing:', {
      totalSessions: sessions?.length || 0,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      timestamp: new Date().toISOString()
    });

    try {
      // Enhanced validation with detailed logging
      if (!Array.isArray(sessions)) {
        console.error('❌ BubbleDataProcessor - Sessions is not an array:', typeof sessions);
        throw new Error('Sessions must be an array');
      }

      if (sessions.length === 0) {
        console.log('🔍 BubbleDataProcessor - No sessions to process');
        return [];
      }

      if (!startDate || !endDate || !(startDate instanceof Date) || !(endDate instanceof Date)) {
        console.error('❌ BubbleDataProcessor - Invalid date range:', { startDate, endDate });
        throw new Error('Invalid date range provided');
      }

      // Enhanced session filtering with detailed validation
      const filteredSessions = sessions.filter((session, index) => {
        try {
          // Basic session validation
          if (!session || typeof session !== 'object') {
            console.warn(`🔍 BubbleDataProcessor - Invalid session at index ${index}:`, session);
            return false;
          }
          
          // Timer validation with detailed logging
          if (!session.timers || !session.timer_id) {
            console.warn(`🔍 BubbleDataProcessor - Session ${index} missing timer data:`, {
              hasTimers: !!session.timers,
              hasTimerId: !!session.timer_id,
              timerId: session.timer_id
            });
            return false;
          }
          
          // Duration validation with detailed logging
          if (!session.duration_ms || typeof session.duration_ms !== 'number' || session.duration_ms <= 0) {
            console.warn(`🔍 BubbleDataProcessor - Session ${index} invalid duration:`, {
              duration_ms: session.duration_ms,
              type: typeof session.duration_ms
            });
            return false;
          }
          
          // Date validation with detailed logging
          if (!session.start_time) {
            console.warn(`🔍 BubbleDataProcessor - Session ${index} missing start_time`);
            return false;
          }
          
          const sessionDate = new Date(session.start_time);
          if (isNaN(sessionDate.getTime())) {
            console.warn(`🔍 BubbleDataProcessor - Session ${index} invalid start_time:`, session.start_time);
            return false;
          }
          
          const inRange = sessionDate >= startDate && sessionDate <= endDate;
          if (!inRange) {
            console.log(`🔍 BubbleDataProcessor - Session ${index} outside date range:`, {
              sessionDate: sessionDate.toISOString(),
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString()
            });
          }
          
          return inRange;
        } catch (error) {
          console.warn(`🔍 BubbleDataProcessor - Session validation error at index ${index}:`, error, session);
          return false;
        }
      });

      console.log('🔍 BubbleDataProcessor - Enhanced filtering results:', {
        original: sessions.length,
        filtered: filteredSessions.length,
        filterRatio: `${((filteredSessions.length / sessions.length) * 100).toFixed(1)}%`
      });

      if (filteredSessions.length === 0) {
        console.log('🔍 BubbleDataProcessor - No sessions passed filtering');
        return [];
      }

      // Enhanced grouping with detailed logging
      const timerGroups: { [key: string]: TimerSessionWithTimer[] } = {};
      let validGroupCount = 0;
      
      filteredSessions.forEach((session, index) => {
        try {
          const timerId = session.timer_id;
          if (!timerId || typeof timerId !== 'string') {
            console.warn(`🔍 BubbleDataProcessor - Invalid timer ID at session ${index}:`, timerId);
            return;
          }
          
          if (!timerGroups[timerId]) {
            timerGroups[timerId] = [];
            validGroupCount++;
          }
          timerGroups[timerId].push(session);
        } catch (error) {
          console.warn(`🔍 BubbleDataProcessor - Grouping error at session ${index}:`, error);
        }
      });

      console.log('🔍 BubbleDataProcessor - Enhanced grouping results:', {
        timerGroups: validGroupCount,
        totalSessions: Object.values(timerGroups).reduce((sum, group) => sum + group.length, 0)
      });

      const timerGroupEntries = Object.entries(timerGroups);
      if (timerGroupEntries.length === 0) {
        console.log('🔍 BubbleDataProcessor - No timer groups created');
        return [];
      }

      // Enhanced statistics calculation with error handling
      const timerStats = timerGroupEntries.map(([timerId, timerSessions], groupIndex) => {
        try {
          const validSessions = timerSessions.filter(s => s.duration_ms && s.duration_ms > 0);
          
          if (validSessions.length === 0) {
            console.warn(`🔍 BubbleDataProcessor - No valid sessions for timer ${timerId}`);
            return null;
          }

          const totalTime = validSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
          const sessionCount = validSessions.length;
          const avgSessionTime = totalTime / sessionCount;
          const timer = validSessions[0]?.timers;
          const isRunning = timerSessions.some(s => 
            typeof s.id === 'string' && s.id.startsWith('virtual-')
          );
          
          const stats = {
            timerId,
            name: timer?.name || `Unknown Timer ${groupIndex + 1}`,
            category: timer?.category || 'Uncategorized', 
            totalTime: Math.max(0, totalTime),
            sessionCount: Math.max(1, sessionCount),
            avgSessionTime: Math.max(1000, avgSessionTime), // Minimum 1 second
            sessions: validSessions,
            isRunning: Boolean(isRunning),
            creationDate: new Date()
          };

          console.log(`🔍 BubbleDataProcessor - Timer stats for ${timerId}:`, {
            name: stats.name,
            totalTime: Math.round(stats.totalTime / (1000 * 60 * 60 * 100)) / 100, // hours
            sessionCount: stats.sessionCount,
            avgSessionTime: Math.round(stats.avgSessionTime / (1000 * 60 * 100)) / 100, // minutes
            isRunning: stats.isRunning
          });

          return stats;
        } catch (error) {
          console.warn(`🔍 BubbleDataProcessor - Timer stats error for ${timerId}:`, error);
          return null;
        }
      }).filter(Boolean);

      if (timerStats.length === 0) {
        console.log('🔍 BubbleDataProcessor - No timer stats generated');
        return [];
      }

      // Enhanced scaling factors calculation
      const totalTimes = timerStats.map(t => t!.totalTime).filter(t => t > 0);
      const sessionCounts = timerStats.map(t => t!.sessionCount).filter(t => t > 0);
      const avgTimes = timerStats.map(t => t!.avgSessionTime).filter(t => t > 0);

      const maxTotalTime = Math.max(...totalTimes, 1);
      const maxSessionCount = Math.max(...sessionCounts, 1);
      const maxAvgTime = Math.max(...avgTimes, 1);

      console.log('🔍 BubbleDataProcessor - Enhanced scaling factors:', {
        maxTotalTime: Math.round(maxTotalTime / (1000 * 60 * 60 * 100)) / 100, // hours
        maxSessionCount,
        maxAvgTime: Math.round(maxAvgTime / (1000 * 60 * 100)) / 100, // minutes
        timerCount: timerStats.length
      });

      // Enhanced bubble generation with detailed position validation
      const bubbles: BubbleData[] = timerStats.map((timer, index) => {
        try {
          if (!timer) return null;

          // Enhanced color generation with logging
          const hue = (index * 137.508) % 360; // Golden angle
          const saturation = 60 + (index * 20) % 40;
          const lightness = 45 + (index * 10) % 20;
          const color = timer.isRunning ? '#22c55e' : `hsl(${hue}, ${saturation}%, ${lightness}%)`;
          
          // Enhanced positioning with bounds checking and logging
          const timeRatio = Math.min(1, Math.max(0, timer.totalTime / maxTotalTime));
          const sessionRatio = Math.min(1, Math.max(0, timer.sessionCount / maxSessionCount));
          const avgRatio = Math.min(1, Math.max(0, timer.avgSessionTime / maxAvgTime));
          
          // Distribute bubbles in 3D space with safe bounds
          const x = Math.max(-10, Math.min(10, (timeRatio * 16) - 8));
          const y = Math.max(-8, Math.min(8, (avgRatio * 12) - 6));
          const z = Math.max(-6, Math.min(6, (sessionRatio * 8) - 4));
          
          // Enhanced size calculation with logging
          const baseSize = Math.max(0.3, Math.min(2.0, Math.log(timer.sessionCount + 1) * 0.5 + 0.2));
          const timeBonus = Math.min(0.8, timer.totalTime / (1000 * 60 * 60 * 10)); // Max 10 hours
          const size = Math.max(0.3, Math.min(3.0, baseSize + timeBonus));
          
          // Safe time formatting
          const totalHours = (timer.totalTime / (1000 * 60 * 60));
          const avgMinutes = (timer.avgSessionTime / (1000 * 60));
          
          const bubble: BubbleData = {
            id: `${timer.timerId}-${index}`,
            position: [x, y, z] as [number, number, number],
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

          console.log(`🔍 BubbleDataProcessor - Generated bubble for ${timer.name}:`, {
            position: bubble.position,
            size: bubble.size,
            color: bubble.color,
            isRunning: bubble.isRunning
          });

          return bubble;
        } catch (error) {
          console.warn(`🔍 BubbleDataProcessor - Bubble generation error for timer ${index}:`, error);
          return null;
        }
      }).filter((bubble): bubble is BubbleData => bubble !== null);

      const processingTime = performance.now() - startTime;
      console.log('✅ BubbleDataProcessor - Enhanced processing complete:', {
        inputSessions: sessions.length,
        filteredSessions: filteredSessions.length,
        timerGroups: timerGroupEntries.length,
        generatedBubbles: bubbles.length,
        processingTime: `${processingTime.toFixed(2)}ms`,
        successRate: `${((bubbles.length / timerStats.length) * 100).toFixed(1)}%`
      });

      return bubbles;

    } catch (error) {
      const processingTime = performance.now() - startTime;
      console.error('❌ BubbleDataProcessor - Critical processing error:', {
        error: error.message,
        stack: error.stack,
        processingTime: `${processingTime.toFixed(2)}ms`,
        inputs: {
          sessionsCount: sessions?.length,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString()
        }
      });
      onError?.(error as Error);
      return [];
    }
  }, [sessions, startDate, endDate, onError]);
};

export const processBubbleData = (sessions: TimerSessionWithTimer[], selectedCategory?: string): BubbleDataPoint[] => {
  try {
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return [];
    }

    // Filter by category if specified
    const filteredSessions = selectedCategory && selectedCategory !== 'all'
      ? sessions.filter(s => s.timers?.category === selectedCategory)
      : sessions;

    // Group by timer
    const timerGroups: { [key: string]: TimerSessionWithTimer[] } = {};
    
    filteredSessions.forEach(session => {
      if (session.timer_id && session.duration_ms && session.duration_ms > 0) {
        if (!timerGroups[session.timer_id]) {
          timerGroups[session.timer_id] = [];
        }
        timerGroups[session.timer_id].push(session);
      }
    });

    // Process each timer group
    return Object.entries(timerGroups).map(([timerId, timerSessions], index) => {
      const totalTime = timerSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
      const sessionCount = timerSessions.length;
      const avgSessionTime = totalTime / sessionCount;
      const timer = timerSessions[0]?.timers;
      const isRunning = timerSessions.some(s => s.id.startsWith('virtual-'));

      const totalHours = totalTime / (1000 * 60 * 60);
      const avgMinutes = avgSessionTime / (1000 * 60);
      const size = Math.max(500, Math.min(8000, totalTime / 1000)); // Size in pixels for 2D

      return {
        id: `${timerId}-${index}`,
        position: [0, 0, 0] as [number, number, number],
        size: size,
        color: isRunning ? 'rgba(34, 197, 94, 0.7)' : 'rgba(255, 182, 193, 0.7)',
        timerName: timer?.name || 'Unknown Timer',
        totalTime: totalTime,
        sessionCount: sessionCount,
        creationDate: new Date(),
        category: timer?.category || 'Uncategorized',
        isRunning: isRunning,
        timerId: timerId,
        name: timer?.name || 'Unknown Timer',
        totalHours: totalHours.toFixed(1),
        avgMinutes: avgMinutes.toFixed(1),
        avgSessionTime: avgSessionTime,
        sessions: timerSessions,
        x: totalHours,
        y: avgMinutes
      };
    });
  } catch (error) {
    console.error('🔍 processBubbleData - Error:', error);
    return [];
  }
};

export default useBubbleDataProcessor;
