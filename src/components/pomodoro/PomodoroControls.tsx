
import React from 'react';
import { Square, Coffee, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PomodoroControlsProps {
  isActive: boolean;
  sessionCount: number;
  timerColor: string;
  onStartWork: () => void;
  onStartBreak: () => void;
  onStop: () => void;
}

const PomodoroControls: React.FC<PomodoroControlsProps> = ({
  isActive,
  sessionCount,
  timerColor,
  onStartWork,
  onStartBreak,
  onStop
}) => {
  return (
    <div className="flex justify-center gap-1">
      {isActive ? (
        <Button
          onClick={onStop}
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs rounded-full border-2 transition-all duration-200"
          style={{ borderColor: timerColor, color: timerColor }}
        >
          <Square className="h-3 w-3 mr-1" />
          Stop
        </Button>
      ) : (
        <>
          <Button
            onClick={onStartWork}
            size="sm"
            className="h-7 px-2 text-xs rounded-full transition-all duration-200"
            style={{ backgroundColor: timerColor, borderColor: timerColor }}
          >
            <Zap className="h-3 w-3 mr-1" />
            Work
          </Button>
          
          <Button
            onClick={onStartBreak}
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs rounded-full border-2 transition-all duration-200"
            style={{ borderColor: timerColor, color: timerColor }}
            disabled={sessionCount === 0}
          >
            <Coffee className="h-3 w-3 mr-1" />
            Break
          </Button>
        </>
      )}
    </div>
  );
};

export default PomodoroControls;
