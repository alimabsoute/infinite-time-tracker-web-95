
import React, { useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Timer as TimerIcon, Coffee, Zap } from 'lucide-react';
import SingleTimerPomodoroCheck from './SingleTimerPomodoroCheck';

interface PomodoroStatusIndicatorProps {
  timers: Array<{ id: string; name: string; isRunning: boolean }>;
}

interface ActivePomodoroData {
  timerId: string;
  timerName: string;
  isActive: boolean;
  currentPhase: string;
  sessionCount: number;
}

const PomodoroStatusIndicator: React.FC<PomodoroStatusIndicatorProps> = ({ timers }) => {
  const [activePomodoro, setActivePomodoro] = useState<ActivePomodoroData | null>(null);

  const handleActivePomodoro = useCallback((data: ActivePomodoroData) => {
    setActivePomodoro(data);
  }, []);

  // Clear active pomodoro when no timers
  React.useEffect(() => {
    if (timers.length === 0) {
      setActivePomodoro(null);
    }
  }, [timers.length]);

  const getPhaseIcon = () => {
    if (!activePomodoro) return <TimerIcon className="h-3 w-3" />;
    
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
    if (!activePomodoro) return 'bg-gray-100 text-gray-700 border-gray-200';
    
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
    <>
      {/* Invisible components that check each timer's pomodoro state */}
      {timers.map(timer => (
        <SingleTimerPomodoroCheck
          key={timer.id}
          timerId={timer.id}
          timerName={timer.name}
          onActivePomodoro={handleActivePomodoro}
        />
      ))}
      
      {/* Show the status indicator only if there's an active pomodoro */}
      {activePomodoro && (
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
      )}
    </>
  );
};

export default PomodoroStatusIndicator;
