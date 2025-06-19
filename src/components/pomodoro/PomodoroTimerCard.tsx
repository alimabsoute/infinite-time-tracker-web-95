
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

  const getPriorityVariant = () => {
    switch (currentPhase) {
      case 'work':
        return 'urgent';
      case 'short-break':
        return 'normal';
      case 'long-break':
        return 'low';
      default:
        return 'none';
    }
  };

  const getPriorityColor = () => {
    switch (currentPhase) {
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

  const progressPercentage = currentSession && remainingTime > 0
    ? ((currentSession.duration - remainingTime) / currentSession.duration) * 100
    : 0;

  const timerColor = getPhaseColor();

  return (
    <div 
      className={cn(
        'relative mb-3 px-1',
        className
      )}
      style={{
        borderRadius: "0.5rem", 
        boxShadow: `0 0 0 2px ${timerColor}40, 0 4px 6px -1px rgba(0, 0, 0, 0.1)`,
        transition: "all 0.2s ease-in-out"
      }}
    >
      <div className="p-2 bg-transparent rounded-lg">
        <div className="flex flex-col">
          {/* Timer Header */}
          <div className="flex items-center justify-between mb-2">
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
          <div className="space-y-0">
            <div className="grid grid-cols-1 gap-0">
              {/* Timer Display */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-20 h-20">
                    <CircularProgressbar
                      value={progressPercentage}
                      text=""
                      styles={buildStyles({
                        pathColor: timerColor,
                        trailColor: '#f3f4f6',
                        backgroundColor: 'transparent',
                        strokeLinecap: 'round',
                        pathTransitionDuration: 0.5,
                      })}
                    />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-lg font-bold leading-none">
                      {isActive ? formatTime(remainingTime) : '00:00'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {getPhaseLabel()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                {/* Timer Controls */}
                <div className="flex justify-center gap-1 mt-2">
                  {isActive ? (
                    <Button
                      onClick={onStop}
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                    >
                      <Square className="h-3 w-3 mr-1" />
                      Stop
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={onStartWork}
                        size="sm"
                        className="h-7 px-2 text-xs"
                        style={{ backgroundColor: timerColor }}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Work
                      </Button>
                      
                      <Button
                        onClick={onStartBreak}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={sessionCount === 0}
                      >
                        <Coffee className="h-3 w-3 mr-1" />
                        Break
                      </Button>
                    </>
                  )}
                </div>
                
                {/* Timer Metadata */}
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
                    <div className="text-center text-xs text-muted-foreground">
                      {totalSessions} sessions today
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Running indicator pulse - positioned like in regular timers */}
          {isActive && (
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div 
                className="absolute top-1 left-1 w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: timerColor }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimerCard;
