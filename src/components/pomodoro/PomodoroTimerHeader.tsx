
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
    <div className="absolute top-0 left-0 right-0 z-20 p-4">
      <div className="flex items-start justify-between">
        {/* Timer name and category */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 leading-tight truncate">
            Pomodoro Timer
          </h3>
          <div className="text-sm text-gray-600 mt-1 truncate">
            {phaseLabel}
          </div>
        </div>
        
        {/* Status badges */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            🍅 {sessionCount}
          </Badge>
          {isActive && (
            <div 
              className="w-2 h-2 rounded-full animate-pulse" 
              style={{ 
                backgroundColor: colors.primaryBorder,
                boxShadow: `0 0 8px ${colors.shadowColor}60`
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimerHeader;
