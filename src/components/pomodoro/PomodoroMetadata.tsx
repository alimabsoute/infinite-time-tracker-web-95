
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PomodoroMetadataProps {
  currentPhase: 'work' | 'short-break' | 'long-break' | 'idle';
  totalSessions: number;
  phaseLabel: string;
}

const PomodoroMetadata: React.FC<PomodoroMetadataProps> = ({
  currentPhase,
  totalSessions,
  phaseLabel
}) => {
  const getPriorityColor = () => {
    switch (currentPhase) {
      case 'work':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'short-break':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'long-break':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="border-t border-border/15 pt-1.5">
      <div className="flex flex-col gap-1">
        <div className="flex justify-center">
          <Badge 
            variant="outline" 
            className={cn("text-xs h-5 px-2", getPriorityColor())}
          >
            {phaseLabel}
          </Badge>
        </div>
        
        {totalSessions > 0 && (
          <div className="text-center text-xs text-muted-foreground opacity-70">
            {totalSessions} sessions today
          </div>
        )}
      </div>
    </div>
  );
};

export default PomodoroMetadata;
