
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, RotateCcw, Coffee, Zap } from 'lucide-react';
import { usePomodoro } from '@/hooks/usePomodoro';
import { formatTime } from '@/components/timer/TimerUtils';

interface PomodoroTimerProps {
  timerId: string;
  isTimerRunning: boolean;
  onTimerToggle: () => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  timerId,
  isTimerRunning,
  onTimerToggle
}) => {
  const {
    pomodoroState,
    startPomodoroSession,
    completePomodoroSession,
    stopPomodoroSession,
    resetPomodoroCycle,
  } = usePomodoro(timerId);

  const [remainingTime, setRemainingTime] = useState(0);

  // Update remaining time for current session
  useEffect(() => {
    if (!pomodoroState.currentSession || !pomodoroState.isActive) {
      setRemainingTime(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - pomodoroState.currentSession!.startTime.getTime();
      const remaining = Math.max(0, pomodoroState.currentSession!.duration - elapsed);
      
      setRemainingTime(remaining);
      
      if (remaining === 0) {
        completePomodoroSession();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pomodoroState.currentSession, pomodoroState.isActive, completePomodoroSession]);

  const handleStartWork = () => {
    if (!isTimerRunning) {
      onTimerToggle(); // Start the regular timer
    }
    startPomodoroSession('work');
  };

  const handleStartBreak = () => {
    const isLongBreak = pomodoroState.sessionCount % pomodoroState.settings.sessionsUntilLongBreak === 0;
    startPomodoroSession(isLongBreak ? 'long-break' : 'short-break');
  };

  const handleStop = () => {
    stopPomodoroSession();
    if (isTimerRunning) {
      onTimerToggle(); // Stop the regular timer
    }
  };

  const getPhaseIcon = () => {
    switch (pomodoroState.currentPhase) {
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
    switch (pomodoroState.currentPhase) {
      case 'work':
        return 'bg-red-500';
      case 'short-break':
        return 'bg-green-500';
      case 'long-break':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const progressPercentage = pomodoroState.currentSession
    ? ((pomodoroState.currentSession.duration - remainingTime) / pomodoroState.currentSession.duration) * 100
    : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            {getPhaseIcon()}
            Pomodoro Timer
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {pomodoroState.sessionCount}/{pomodoroState.settings.sessionsUntilLongBreak}
            </Badge>
            {pomodoroState.isActive && (
              <div className={`w-2 h-2 rounded-full ${getPhaseColor()} animate-pulse`} />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {pomodoroState.isActive && pomodoroState.currentSession ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatTime(remainingTime)}
              </div>
              <div className="text-sm text-muted-foreground capitalize">
                {pomodoroState.currentPhase.replace('-', ' ')} session
              </div>
            </div>
            
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="flex gap-2">
              <Button
                onClick={handleStop}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center text-muted-foreground">
              <div className="text-lg font-medium">Ready to focus?</div>
              <div className="text-sm">
                Start a Pomodoro session to boost your productivity
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleStartWork}
                className="flex-1"
                disabled={pomodoroState.isActive}
              >
                <Zap className="h-4 w-4 mr-2" />
                Start Work
              </Button>
              
              <Button
                onClick={handleStartBreak}
                variant="outline"
                className="flex-1"
                disabled={pomodoroState.isActive || pomodoroState.sessionCount === 0}
              >
                <Coffee className="h-4 w-4 mr-2" />
                Take Break
              </Button>
            </div>
            
            {pomodoroState.sessionCount > 0 && (
              <Button
                onClick={resetPomodoroCycle}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Cycle
              </Button>
            )}
          </div>
        )}
        
        {pomodoroState.totalSessions > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground text-center">
              Total sessions completed today: {pomodoroState.totalSessions}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PomodoroTimer;
