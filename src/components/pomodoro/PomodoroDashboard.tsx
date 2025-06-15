
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coffee, Zap, Clock, Target } from 'lucide-react';
import { usePomodoro } from '@/hooks/usePomodoro';
import { Timer } from '../../types';

interface PomodoroDashboardProps {
  timers: Timer[];
}

const PomodoroDashboard: React.FC<PomodoroDashboardProps> = ({ timers }) => {
  // Get Pomodoro data for all timers
  const pomodoroData = timers.map(timer => {
    const { pomodoroState } = usePomodoro(timer.id);
    return {
      timerId: timer.id,
      timerName: timer.name,
      ...pomodoroState
    };
  });

  // Calculate aggregated stats
  const totalWorkSessions = pomodoroData.reduce((sum, data) => sum + data.sessionCount, 0);
  const totalSessions = pomodoroData.reduce((sum, data) => sum + data.totalSessions, 0);
  const activePomodoros = pomodoroData.filter(data => data.isActive).length;
  const averageSessionsPerTimer = timers.length > 0 ? Math.round(totalSessions / timers.length) : 0;

  // Find most productive timer (highest session count)
  const mostProductiveTimer = pomodoroData.reduce((prev, current) => 
    (current.sessionCount > prev.sessionCount) ? current : prev, 
    pomodoroData[0] || { timerName: 'None', sessionCount: 0 }
  );

  // Calculate daily goal progress (assume 8 sessions as daily goal)
  const dailyGoal = 8;
  const dailyProgress = Math.min(100, (totalSessions / dailyGoal) * 100);

  if (totalSessions === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5" />
            Pomodoro Overview
          </CardTitle>
          <CardDescription>
            Start using Pomodoro technique to boost your productivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Coffee className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No Pomodoro sessions yet</p>
            <p className="text-xs">Switch to the Pomodoro tab on any timer to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5" />
          Pomodoro Overview
          {activePomodoros > 0 && (
            <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700 border-red-200">
              {activePomodoros} active
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Your productivity with the Pomodoro technique today
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Daily Goal Progress</span>
            </div>
            <span className="text-sm text-muted-foreground">{totalSessions}/{dailyGoal}</span>
          </div>
          <Progress value={dailyProgress} className="h-2" />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-secondary/20 rounded-md">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-lg font-bold">{totalWorkSessions}</span>
            </div>
            <div className="text-xs text-muted-foreground">Work Sessions</div>
          </div>
          
          <div className="text-center p-3 bg-secondary/20 rounded-md">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Coffee className="h-4 w-4 text-green-500" />
              <span className="text-lg font-bold">{totalSessions - totalWorkSessions}</span>
            </div>
            <div className="text-xs text-muted-foreground">Break Sessions</div>
          </div>
        </div>

        {/* Most Productive Timer */}
        {mostProductiveTimer.sessionCount > 0 && (
          <div className="pt-2 border-t border-border/30">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Most Productive</p>
                <p className="text-xs text-muted-foreground">{mostProductiveTimer.timerName}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {mostProductiveTimer.sessionCount} sessions
              </Badge>
            </div>
          </div>
        )}

        {/* Average Performance */}
        <div className="pt-2 border-t border-border/30">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Average per timer</span>
            <span>{averageSessionsPerTimer} sessions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PomodoroDashboard;
