
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer as TimerIcon, Coffee, Zap, Target } from 'lucide-react';
import { Timer as TimerType } from '@/types';

interface PomodoroStatsProps {
  timers: TimerType[];
}

const PomodoroStats: React.FC<PomodoroStatsProps> = ({ timers }) => {
  const runningTimers = timers.filter(t => t.isRunning).length;

  // For now, we'll show basic timer stats
  // TODO: Add proper Pomodoro session tracking
  const totalTimers = timers.length;
  const activeTimers = runningTimers;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Timers</CardTitle>
          <TimerIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeTimers}</div>
          <p className="text-xs text-muted-foreground">Currently running</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ready for Pomodoro</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTimers}</div>
          <p className="text-xs text-muted-foreground">Available timers</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Focus Sessions</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">Sessions today</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productivity</CardTitle>
          <Coffee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {activeTimers > 0 ? (
              <Badge variant="secondary" className="text-lg font-bold">
                🔥 Active
              </Badge>
            ) : (
              <span className="text-muted-foreground">Ready</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PomodoroStats;
