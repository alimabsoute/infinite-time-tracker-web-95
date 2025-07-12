
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
    const filteredSessions = sessions.filter(session => 
      session.duration_ms && 
      session.timers &&
      (!selectedCategory || selectedCategory === 'all' || session.timers.category === selectedCategory)
    );

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

    if (timerMetrics.length === 0) return [];

    const maxTotalTime = Math.max(...timerMetrics.map(t => t.totalTime));
    const maxSessionCount = Math.max(...timerMetrics.map(t => t.sessionCount));
    const maxAvgTime = Math.max(...timerMetrics.map(t => t.avgSessionTime));

    return timerMetrics.map((timer, index) => {
      const x = (timer.totalTime / maxTotalTime) * 6 - 3; // Total time on X-axis
      const y = (timer.avgSessionTime / maxAvgTime) * 4 - 2; // Avg session time on Y-axis
      const z = (Math.sin(index * 0.8) * 3); // Distribute in Z axis
      const size = (timer.sessionCount / maxSessionCount) * 0.6 + 0.3; // Session count determines size

      return {
        position: [x, y, z] as [number, number, number],
        size,
        color: PASTEL_COLORS_3D[timer.category] || PASTEL_COLORS_3D['Uncategorized'],
        timer
      };
    });
  }, [sessions, selectedCategory]);
};
