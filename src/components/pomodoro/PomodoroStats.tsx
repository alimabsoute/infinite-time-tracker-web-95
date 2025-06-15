
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Coffee, Zap } from 'lucide-react';
import { usePomodoro } from '@/hooks/usePomodoro';

interface PomodoroStatsProps {
  timerId: string;
  compact?: boolean;
}

const PomodoroStats: React.FC<PomodoroStatsProps> = ({ timerId, compact = false }) => {
  const { pomodoroState } = usePomodoro(timerId);

  if (pomodoroState.totalSessions === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="pt-2 border-t border-border/30 mt-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span>Sessions: {pomodoroState.sessionCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Coffee className="h-3 w-3" />
            <span>Total: {pomodoroState.totalSessions}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-2 bg-secondary/20 rounded-md">
          <div className="text-lg font-bold">{pomodoroState.sessionCount}</div>
          <div className="text-xs text-muted-foreground">Work Sessions</div>
        </div>
        <div className="text-center p-2 bg-secondary/20 rounded-md">
          <div className="text-lg font-bold">{pomodoroState.totalSessions}</div>
          <div className="text-xs text-muted-foreground">Total Sessions</div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Badge variant="outline" className="text-xs">
          Next: {pomodoroState.sessionCount % pomodoroState.settings.sessionsUntilLongBreak === 0 ? 'Long Break' : 'Short Break'}
        </Badge>
      </div>
    </div>
  );
};

export default PomodoroStats;
