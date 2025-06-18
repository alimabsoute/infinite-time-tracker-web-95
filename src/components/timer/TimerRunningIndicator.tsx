
import React from 'react';
import { ProcessedTimerColors } from '../../utils/timerColorProcessor';

interface TimerRunningIndicatorProps {
  isRunning: boolean;
  colors: ProcessedTimerColors;
}

const TimerRunningIndicator: React.FC<TimerRunningIndicatorProps> = ({
  isRunning,
  colors
}) => {
  if (!isRunning) return null;

  return (
    <div 
      className="absolute top-1 right-1 w-3 h-3 rounded-full animate-pulse z-20"
      style={{ 
        backgroundColor: colors.primaryBorder,
        boxShadow: `0 0 10px ${colors.shadowColor}50`
      }}
    />
  );
};

export default TimerRunningIndicator;
