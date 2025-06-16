
import React from 'react';

interface TimerStatusIndicatorProps {
  isRunning: boolean;
  isPomodoroActive: boolean;
  timerColor: string;
}

const TimerStatusIndicator: React.FC<TimerStatusIndicatorProps> = ({
  isRunning,
  isPomodoroActive,
  timerColor,
}) => {
  if (!isRunning && !isPomodoroActive) return null;

  return (
    <div className="absolute top-1 right-1 flex items-center">
      <span className="relative flex h-2 w-2">
        <span 
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" 
          style={{ backgroundColor: isPomodoroActive ? '#ef4444' : timerColor }}
        />
        <span 
          className="relative inline-flex rounded-full h-2 w-2" 
          style={{ backgroundColor: isPomodoroActive ? '#ef4444' : timerColor }}
        />
      </span>
    </div>
  );
};

export default TimerStatusIndicator;
