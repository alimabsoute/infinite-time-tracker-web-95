
import React, { useMemo } from 'react';
import { format, addDays } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Timer, TrendingUp } from 'lucide-react';
import { TimerSessionWithTimer } from "../../types";
import { getSessionsForDateRange } from "./CalendarUtils";

interface WeekDataSummaryProps {
  currentWeekStart: Date;
  sessions: TimerSessionWithTimer[];
}

const WeekDataSummary: React.FC<WeekDataSummaryProps> = ({
  currentWeekStart,
  sessions
}) => {
  const weekData = useMemo(() => {
    const weekEnd = addDays(currentWeekStart, 6);
    const weekSessions = getSessionsForDateRange(currentWeekStart, weekEnd, sessions);
    
    const totalTime = weekSessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0);
    
    // Group by timer/category
    const timerStats = new Map<string, { count: number; time: number; category: string }>();
    weekSessions.forEach(session => {
      const timerName = session.timers?.name || 'Unnamed Timer';
      const category = session.timers?.category || 'Uncategorized';
      const existing = timerStats.get(timerName) || { count: 0, time: 0, category };
      existing.count += 1;
      existing.time += session.duration_ms || 0;
      timerStats.set(timerName, existing);
    });

    // Get top timers
    const topTimers = Array.from(timerStats.entries())
      .sort((a, b) => b[1].time - a[1].time)
      .slice(0, 3);

    // Daily breakdown
    const dailyBreakdown = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(currentWeekStart, i);
      const daySessions = weekSessions.filter(session => {
        const sessionDate = new Date(session.start_time);
        return sessionDate.toDateString() === date.toDateString();
      });
      const dayTime = daySessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0);
      
      return {
        date,
        dayName: format(date, 'EEE'),
        sessionCount: daySessions.length,
        totalTime: dayTime
      };
    });

    const activeDays = dailyBreakdown.filter(day => day.totalTime > 0).length;
    const avgDailyTime = activeDays > 0 ? totalTime / activeDays : 0;

    return {
      totalTime,
      sessionCount: weekSessions.length,
      activeDays,
      avgDailyTime,
      topTimers,
      dailyBreakdown
    };
  }, [currentWeekStart, sessions]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (weekData.totalTime === 0) {
    return null; // Don't show summary for weeks with no data
  }

  return (
    <Card className="glass-effect border border-border/30">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Week Overview */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {formatTime(weekData.totalTime)}
              </div>
              <div className="text-xs text-muted-foreground">Total Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {weekData.sessionCount}
              </div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {weekData.activeDays}
              </div>
              <div className="text-xs text-muted-foreground">Active Days</div>
            </div>
          </div>

          {/* Top Timers */}
          {weekData.topTimers.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-1">
                <Timer className="h-3 w-3" />
                Top Timers
              </div>
              <div className="space-y-1">
                {weekData.topTimers.map(([timerName, stats], index) => (
                  <div key={timerName} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        #{index + 1}
                      </Badge>
                      <span className="truncate">{timerName}</span>
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {stats.category}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground ml-2">
                      {formatTime(stats.time)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Pattern */}
          <div>
            <div className="text-sm font-medium mb-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Daily Pattern
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weekData.dailyBreakdown.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    {day.dayName}
                  </div>
                  <div className={`h-8 rounded text-xs flex items-center justify-center ${
                    day.totalTime > 0 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {day.totalTime > 0 ? formatTime(day.totalTime) : '0'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Average Daily Time */}
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="text-xs text-muted-foreground">Average Daily Time</div>
            <div className="text-sm font-medium flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(weekData.avgDailyTime)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekDataSummary;
