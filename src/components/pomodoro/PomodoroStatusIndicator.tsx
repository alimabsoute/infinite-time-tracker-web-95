
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Timer as TimerIcon, Coffee, Zap } from 'lucide-react';
import { usePomodoro } from '@/hooks/usePomodoro';

interface PomodoroStatusIndicatorProps {
  timers: Array<{ id: string; name: string; isRunning: boolean }>;
}

const PomodoroStatusIndicator: React.FC<PomodoroStatusIndicatorProps> = ({ timers }) => {
  // Check for active Pomodoro sessions across all timers
  const activePomodoros = timers
    .map(timer => {
      const { pomodoroState } = usePomodoro(timer.id);
      return {
        timerId: timer.id,
        timerName: timer.name,
        isActive: pomodoroState.isActive,
        currentPhase: pomodoroState.currentPhase,
        sessionCount: pomodoroState.sessionCount
      };
    })
    .filter(p => p.isActive);

  if (activePomodoros.length === 0) {
    return null;
  }

  const activePomodoro = activePomodoros[0]; // Show the first active one

  const getPhaseIcon = () => {
    switch (activePomodoro.currentPhase) {
      case 'work':
        return <Zap className="h-3 w-3" />;
      case 'short-break':
      case 'long-break':
        return <Coffee className="h-3 w-3" />;
      default:
        return <TimerIcon className="h-3 w-3" />;
    }
  };

  const getPhaseColor = () => {
    switch (activePomodoro.currentPhase) {
      case 'work':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'short-break':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'long-break':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge variant="secondary" className={`${getPhaseColor()} animate-pulse`}>
        <div className="flex items-center gap-1">
          {getPhaseIcon()}
          <span className="text-xs font-medium">
            🍅 {activePomodoro.currentPhase.replace('-', ' ')} 
            {activePomodoro.sessionCount > 0 && ` (${activePomodoro.sessionCount})`}
          </span>
        </div>
      </Badge>
    </div>
  );
};

export default PomodoroStatusIndicator;
