
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
  return (
    <ResizableActivityVisualization
      filteredTimers={filteredTimers}
      sessions={sessions}
      formatTime={formatTime}
    />
  );
};

export default ActivityVisualization;
