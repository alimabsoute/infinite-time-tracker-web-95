
import React from 'react';
import { Play, Pause, Square, Coffee, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PomodoroState } from '@/types/pomodoro';
import { formatTime } from '@/components/timer/TimerUtils';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface PomodoroTimerCardProps {
  pomodoroState: PomodoroState;
  remainingTime: number;
  onStartWork: () => void;
  onStartBreak: () => void;
  onStop: () => void;
  onReset: () => void;
  className?: string;
}

const PomodoroTimerCard: React.FC<PomodoroTimerCardProps> = ({
  pomodoroState,
  remainingTime,
  onStartWork,
  onStartBreak,
  onStop,
  onReset,
  className
}) => {
  const { isActive, currentSession, currentPhase, sessionCount, totalSessions, settings } = pomodoroState;

  const getPhaseIcon = () => {
    switch (currentPhase) {
      case 'work':
        return <Zap className="h-4 w-4" />;
      case 'short-break':
      case 'long-break':
        return <Coffee className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'work':
        return '#ef4444'; // red-500
      case 'short-break':
        return '#10b981'; // green-500
      case 'long-break':
        return '#3b82f6'; // blue-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  const getPhaseLabel = () => {
    switch (currentPhase) {
      case 'work':
        return 'Work Session';
      case 'short-break':
        return 'Short Break';
      case 'long-break':
        return 'Long Break';
      default:
        return 'Ready';
    }
  };

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

  const progressPercentage = currentSession && remainingTime > 0
    ? ((currentSession.duration - remainingTime) / currentSession.duration) * 100
    : 0;

  const timerColor = getPhaseColor();

  return (
    <div 
      className={cn(
        'relative w-full max-w-[260px] mx-auto transition-all duration-200 hover:scale-[1.02]',
        className
      )}
      style={{
        borderRadius: "8px", 
        border: `2px solid ${timerColor}`,
        background: 'transparent',
        boxShadow: isActive 
          ? `0 0 0 1px ${timerColor}, 0 0 16px ${timerColor}50, 0 2px 12px rgba(0, 0, 0, 0.1)` 
          : `0 0 0 1px ${timerColor}90, 0 1px 6px rgba(0, 0, 0, 0.06)`,
      }}
    >
      <div className="p-2 rounded-[6px]">
        <div className="flex flex-col space-y-1">
          {/* Timer Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {getPhaseIcon()}
              <span className="font-medium text-sm">Pomodoro</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs h-4 px-1">
                🍅 {sessionCount}
              </Badge>
              {isActive && (
                <div 
                  className="w-2 h-2 rounded-full animate-pulse" 
                  style={{ backgroundColor: timerColor }}
                />
              )}
            </div>
          </div>

          {/* Timer Content */}
          <div className="space-y-1.5">
            {/* Timer Display */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-24 h-24">
                  <CircularProgressbar
                    value={progressPercentage}
                    text=""
                    styles={buildStyles({
                      pathColor: timerColor,
                      trailColor: `${timerColor}15`,
                      backgroundColor: 'transparent',
                      strokeLinecap: 'round',
                      pathTransitionDuration: 0.2,
                      strokeWidth: 6,
                    })}
                  />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-base font-bold leading-tight">
                    {isActive ? formatTime(remainingTime) : '00:00'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 opacity-60">
                    {getPhaseLabel()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-1.5">
              {/* Timer Controls */}
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
              
              {/* Timer Metadata */}
              <div className="border-t border-border/15 pt-1.5">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-center">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs h-5 px-2", getPriorityColor())}
                    >
                      {getPhaseLabel()}
                    </Badge>
                  </div>
                  
                  {totalSessions > 0 && (
                    <div className="text-center text-xs text-muted-foreground opacity-70">
                      {totalSessions} sessions today
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Running indicator pulse */}
          {isActive && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimerCard;
