
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

  const indicatorStyle: React.CSSProperties = {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '12px',
    height: '12px',
    aspectRatio: '1',
    borderRadius: '50%',
    backgroundColor: colors.primaryBorder,
    boxShadow: `0 0 10px ${colors.shadowColor}50`,
    zIndex: 20,
    animation: 'pulse 2s infinite'
  };

  return (
    <div 
      className="timer-running-indicator animate-pulse"
      style={indicatorStyle}
    />
  );
};

export default TimerRunningIndicator;
