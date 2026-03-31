import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import { Activity, Clock, Trophy, TrendingUp } from 'lucide-react';
import { useTimers } from '@features/timer/hooks/useTimers';
import { useTimerSessions } from '@features/calendar/hooks/useTimerSessions';
import { format, startOfWeek, startOfMonth } from 'date-fns';

const ActivityOverviewCard: React.FC = () => {
  const { timers } = useTimers();
  const { sessions, loading } = useTimerSessions();
  const [weeklyTime, setWeeklyTime] = useState(0);
  const [monthlyTime, setMonthlyTime] = useState(0);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  useEffect(() => {
    if (!sessions.length) return;

    const now = new Date();
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    // Calculate weekly and monthly time
    let weeklyMs = 0;
    let monthlyMs = 0;
    const recent: any[] = [];

    sessions.forEach(session => {
      const sessionDate = new Date(session.start_time);
      const duration = session.duration_ms || 0;

      if (sessionDate >= weekStart) {
        weeklyMs += duration;
      }
      if (sessionDate >= monthStart) {
        monthlyMs += duration;
      }

      // Get recent sessions (last 5)
      if (recent.length < 5) {
        recent.push(session);
      }
    });

    setWeeklyTime(weeklyMs);
    setMonthlyTime(monthlyMs);
    setRecentSessions(recent.slice(0, 5));
  }, [sessions]);

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getActivityLevel = () => {
    const totalHours = monthlyTime / (1000 * 60 * 60);
    if (totalHours >= 40) return { level: 'High', color: 'bg-green-500' };
    if (totalHours >= 20) return { level: 'Medium', color: 'bg-yellow-500' };
    if (totalHours >= 5) return { level: 'Low', color: 'bg-blue-500' };
    return { level: 'Starting', color: 'bg-gray-500' };
  };

  const activityLevel = getActivityLevel();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Overview
        </CardTitle>
        <CardDescription>
          Your recent timer activity and productivity insights.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">This Week</span>
            </div>
            <p className="text-2xl font-bold">{formatDuration(weeklyTime)}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">This Month</span>
            </div>
            <p className="text-2xl font-bold">{formatDuration(monthlyTime)}</p>
          </div>
        </div>

        {/* Activity Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Activity Level</span>
            <Badge variant="secondary" className="gap-1">
              <div className={`w-2 h-2 rounded-full ${activityLevel.color}`} />
              {activityLevel.level}
            </Badge>
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Quick Stats</span>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Total Timers</span>
              <span className="font-medium">{timers.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Running Now</span>
              <span className="font-medium">{timers.filter(t => t.isRunning).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total Sessions</span>
              <span className="font-medium">{sessions.length}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recent Sessions</h4>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading recent activity...</p>
          ) : recentSessions.length > 0 ? (
            <div className="space-y-2">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">
                    {session.timers?.name || 'Unknown Timer'}
                  </span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{formatDuration(session.duration_ms || 0)}</span>
                    <span>•</span>
                    <span>{format(new Date(session.start_time), 'MMM d')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent sessions found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityOverviewCard;