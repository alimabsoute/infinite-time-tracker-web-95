
import React from 'react';
import { TimerSessionWithTimer } from '../../../types';

const PASTEL_COLORS_3D: { [key: string]: string } = {
  'Work': '#93C5FD',        // Light blue
  'Personal': '#A7F3D0',    // Light green
  'Study': '#FDE047',       // Light yellow
  'Exercise': '#FCA5A5',    // Light red
  'Health': '#C4B5FD',      // Light purple
  'Uncategorized': '#D1D5DB', // Light gray
};

export interface BubbleMetric {
  position: [number, number, number];
  size: number;
  color: string;
  timer: any;
}

interface BubbleMetricsProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
}

export const useBubbleMetrics = ({ sessions, selectedCategory }: BubbleMetricsProps): BubbleMetric[] => {
  return React.useMemo(() => {
      totalSessions: sessions.length,
      selectedCategory,
      sampleSession: sessions[0] ? {
        id: sessions[0].id,
        timer_id: sessions[0].timer_id,
        duration_ms: sessions[0].duration_ms,
        timers: sessions[0].timers
      } : null
    });

    const filteredSessions = sessions.filter(session => {
      const hasValidData = session.duration_ms && session.duration_ms > 0 && session.timers;
      const categoryMatch = !selectedCategory || selectedCategory === 'all' || session.timers?.category === selectedCategory;
      return hasValidData && categoryMatch;
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

    // Calculate metrics for each timer
    const timerMetrics = Object.entries(timerGroups).map(([timerId, timerSessions]) => {
      const totalTime = timerSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
      const sessionCount = timerSessions.length;
      const avgSessionTime = totalTime / sessionCount;
      const timer = timerSessions[0].timers;
      
      return {
        timerId,
        name: timer?.name || 'Unknown Timer',
        category: timer?.category || 'Uncategorized',
        totalTime,
        sessionCount,
        avgSessionTime,
        sessions: timerSessions
      };
    });

    if (timerMetrics.length === 0) {
      return [];
    }

    const maxTotalTime = Math.max(...timerMetrics.map(t => t.totalTime));
    const maxSessionCount = Math.max(...timerMetrics.map(t => t.sessionCount));
    const maxAvgTime = Math.max(...timerMetrics.map(t => t.avgSessionTime));

      maxTotalTime,
      maxSessionCount,
      maxAvgTime,
      timerCount: timerMetrics.length
    });

    const bubbles = timerMetrics.map((timer, index) => {
      // Ensure positions are within reasonable bounds
      const x = Math.max(-5, Math.min(5, (timer.totalTime / maxTotalTime) * 8 - 4));
      const y = Math.max(-3, Math.min(3, (timer.avgSessionTime / maxAvgTime) * 6 - 3));
      const z = Math.max(-3, Math.min(3, (Math.sin(index * 0.8) * 2.5)));
      
      // Ensure size is reasonable (0.2 to 1.5)
      const size = Math.max(0.2, Math.min(1.5, (timer.sessionCount / maxSessionCount) * 1.0 + 0.3));

      return {
        position: [x, y, z] as [number, number, number],
        size,
        color: PASTEL_COLORS_3D[timer.category] || PASTEL_COLORS_3D['Uncategorized'],
        timer
      };
    });


    return bubbles;
  }, [sessions, selectedCategory]);
};
