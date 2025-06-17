
import React from 'react';

interface PomodoroPulseIndicatorProps {
  isActive: boolean;
  timerColor: string;
}

const PomodoroPulseIndicator: React.FC<PomodoroPulseIndicatorProps> = ({
  isActive,
  timerColor
}) => {
  if (!isActive) return null;

  return (
    <div className="absolute top-1 right-1">
      <span className="relative flex h-2 w-2">
        <span 
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" 
          style={{ backgroundColor: timerColor }}
        />
        <span 
          className="relative inline-flex rounded-full h-2 w-2" 
          style={{ backgroundColor: timerColor }}
        />
      </span>
    </div>
  );
};

export default PomodoroPulseIndicator;
