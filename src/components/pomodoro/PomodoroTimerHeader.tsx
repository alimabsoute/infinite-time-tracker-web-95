
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ProcessedPomodoroColors } from '@/utils/pomodoroColorProcessor';

interface PomodoroTimerHeaderProps {
  phaseLabel: string;
  sessionCount: number;
  isActive: boolean;
  colors: ProcessedPomodoroColors;
}

const PomodoroTimerHeader: React.FC<PomodoroTimerHeaderProps> = ({
  phaseLabel,
  sessionCount,
  isActive,
  colors
}) => {
  return (
    <div className="flex items-start justify-between">
      {/* Timer name and category */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-800 leading-tight truncate">
          Pomodoro
        </h3>
        <div className="text-xs text-gray-600 mt-0.5 truncate">
          {phaseLabel}
        </div>
      </div>
      
      {/* Status badges */}
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="text-xs px-1 py-0">
          🍅 {sessionCount}
        </Badge>
        {isActive && (
          <div 
            className="w-2 h-2 rounded-full animate-pulse" 
            style={{ 
              backgroundColor: colors.primaryBorder,
              boxShadow: `0 0 6px ${colors.shadowColor}60`
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PomodoroTimerHeader;
