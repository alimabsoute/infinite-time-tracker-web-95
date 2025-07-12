
import React from 'react';
import { Timer, TimerSessionWithTimer } from "../../types";
import ResizableActivityVisualization from './visualization/ResizableActivityVisualization';

interface ActivityVisualizationProps {
  filteredTimers: Timer[];  
  sessions: TimerSessionWithTimer[];
  formatTime: (ms: number) => string;
}

const ActivityVisualization: React.FC<ActivityVisualizationProps> = ({ 
  filteredTimers, 
  sessions, 
  formatTime 
}) => {
  console.log('ActivityVisualization - Rendering with enhanced components:', {
    sessionsCount: sessions.length,
    timersCount: filteredTimers.length
  });

  return (
    <ResizableActivityVisualization
      filteredTimers={filteredTimers}
      sessions={sessions}
      formatTime={formatTime}
    />
  );
};

export default ActivityVisualization;
