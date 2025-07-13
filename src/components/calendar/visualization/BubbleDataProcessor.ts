
import { useMemo } from 'react';
import { differenceInDays, isWithinInterval } from 'date-fns';
import { TimerSessionWithTimer } from '../../../types';

// Unified BubbleData interface that works for both 2D and 3D
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
  // Additional properties for 2D compatibility
  timerId: string;
  name: string;
  totalHours: string;
  avgMinutes: string;
  avgSessionTime: number;
  sessions: TimerSessionWithTimer[];
  // 2D chart specific properties
  x?: number;
  y?: number;
}

// Legacy interface for backward compatibility
export interface BubbleDataPoint extends BubbleData {
  x: number;
  y: number;
}

// Light pastel colors with transparency
const PASTEL_COLORS = [
  'rgba(255, 182, 193, 0.7)', // Light Pink
  'rgba(173, 216, 230, 0.7)', // Light Blue
  'rgba(144, 238, 144, 0.7)', // Light Green
  'rgba(255, 218, 185, 0.7)', // Peach
  'rgba(221, 160, 221, 0.7)', // Plum
  'rgba(255, 255, 224, 0.7)', // Light Yellow
  'rgba(175, 238, 238, 0.7)', // Pale Turquoise
  'rgba(255, 192, 203, 0.7)', // Pink
  'rgba(230, 230, 250, 0.7)', // Lavender
  'rgba(255, 228, 225, 0.7)', // Misty Rose
  'rgba(240, 248, 255, 0.7)', // Alice Blue
  'rgba(250, 240, 230, 0.7)', // Linen
];

// Hook for 3D bubble data processing
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
          
          // Size calculation - DRAMATICALLY increased scaling for large bubbles
          const timeInHours = Math.max(0, data.totalTime / 3600000);
          const baseSize = Math.max(0.3, Math.min(2, Math.log(timeInHours + 1) * 0.8));
          
          // Calculate metrics for 2D compatibility
          const avgSessionTime = data.totalTime / data.sessions.length;
          const totalHours = (data.totalTime / (1000 * 60 * 60)).toFixed(1);
          const avgMinutes = (avgSessionTime / (1000 * 60)).toFixed(1);
          
          // Validate values
          if (!isFinite(xPosition) || !isFinite(yPosition) || !isFinite(zPosition) || !isFinite(baseSize)) {
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
            size: baseSize,
            color,
            timerName,
            totalTime: data.totalTime,
            sessionCount: data.sessions.length,
            creationDate: data.createdAt,
            category: data.category,
            isRunning: data.isRunning,
            // Additional properties for compatibility
            timerId: data.timerId,
            name: timerName,
            totalHours,
            avgMinutes,
            avgSessionTime,
            sessions: data.sessions,
            // 2D chart properties
            x: data.totalTime / (1000 * 60 * 60), // Total hours for X axis
            y: avgSessionTime / (1000 * 60) // Avg session minutes for Y axis
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

// Function for 2D bubble data processing (backward compatibility)
export const processBubbleData = (
  sessions: TimerSessionWithTimer[], 
  selectedCategory?: string
): BubbleDataPoint[] => {
  console.log('🔍 BubbleDataProcessor - Processing sessions for 2D:', {
    totalSessions: sessions.length,
    selectedCategory
  });
  
  // Filter sessions with proper validation
  const filteredSessions = sessions.filter(session => {
    const hasDuration = session.duration_ms && session.duration_ms > 0;
    const hasTimer = session.timers && session.timer_id && session.timers.name;
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || session.timers?.category === selectedCategory;
    
    return hasDuration && hasTimer && matchesCategory;
  });

  if (filteredSessions.length === 0) {
    return [];
  }

  // Group sessions by timer
  const timerGroups: { [key: string]: TimerSessionWithTimer[] } = {};
  filteredSessions.forEach(session => {
    const timerId = session.timer_id;
    if (!timerGroups[timerId]) {
      timerGroups[timerId] = [];
    }
    timerGroups[timerId].push(session);
  });

  const bubbleData = Object.entries(timerGroups).map(([timerId, timerSessions], index) => {
    const totalTime = timerSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
    const sessionCount = timerSessions.length;
    const avgSessionTime = totalTime / sessionCount;
    const timer = timerSessions[0].timers;
    
    // Check if any session is a running timer (virtual session)
    const isRunning = timerSessions.some(s => s.id.startsWith('virtual-'));
    
    // Calculate bubble size - DRAMATICALLY increased scaling
    const hoursLogged = totalTime / (1000 * 60 * 60);
    // Minimum size 500, maximum size 8000, much more aggressive scaling
    const bubbleSize = Math.max(500, Math.min(8000, hoursLogged * 1200 + sessionCount * 200));
    
    // Use light pastel colors with transparency
    let color = PASTEL_COLORS[index % PASTEL_COLORS.length];
    
    // Special color for running timers - bright green with transparency
    if (isRunning) {
      color = 'rgba(34, 197, 94, 0.8)'; // Bright green with transparency
    }
    
    const dataPoint: BubbleDataPoint = {
      id: `${timerId}-${index}`,
      position: [0, 0, 0] as [number, number, number], // Default 3D position
      size: bubbleSize, // MUCH larger size range (500-8000)
      color,
      timerName: timer?.name || 'Unknown Timer',
      totalTime,
      sessionCount,
      creationDate: new Date(),
      category: timer?.category || 'Uncategorized',
      isRunning,
      // Required properties
      timerId,
      name: timer?.name || 'Unknown Timer',
      totalHours: (totalTime / (1000 * 60 * 60)).toFixed(1),
      avgMinutes: (avgSessionTime / (1000 * 60)).toFixed(1),
      avgSessionTime,
      sessions: timerSessions,
      // 2D specific properties
      x: totalTime / (1000 * 60 * 60), // Total hours
      y: avgSessionTime / (1000 * 60), // Avg session minutes
    };
    
    console.log('🔍 BubbleDataProcessor - Created bubble with LARGE size:', {
      name: dataPoint.name,
      totalHours: dataPoint.totalHours,
      sessionCount: dataPoint.sessionCount,
      bubbleSize: dataPoint.size,
      isRunning: dataPoint.isRunning,
      color: dataPoint.color
    });
    
    return dataPoint;
  });

  return bubbleData;
};

export type { BubbleData };
