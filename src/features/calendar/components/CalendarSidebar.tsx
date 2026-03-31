
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Progress } from "@shared/components/ui/progress";
import { Button } from "@shared/components/ui/button";
import { 
  Calendar, 
  TrendingUp, 
  Clock, 
  Target, 
  BarChart3,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, compareAsc, isPast, addDays } from 'date-fns';
import { Timer, TimerSessionWithTimer } from "../../types";
import { getTotalTimeForDate, formatTime } from './CalendarUtils';

interface CalendarSidebarProps {
  currentMonth: Date;
  selectedDate: Date | undefined;
  timers: Timer[];
  sessions: TimerSessionWithTimer[];
  onDateSelect: (date: Date) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  currentMonth,
  selectedDate,
  timers,
  sessions,
  onDateSelect
}) => {
  // Calculate monthly performance data
  const monthlyData = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    const monthSessions = sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return isWithinInterval(sessionDate, { start: monthStart, end: monthEnd });
    });
    
    const totalTime = monthSessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0);
    const totalSessions = monthSessions.length;
    const daysActive = new Set(
      monthSessions.map(session => format(new Date(session.start_time), 'yyyy-MM-dd'))
    ).size;
    
    // Category breakdown
    const categoryData = monthSessions.reduce((acc, session) => {
      const category = session.timers?.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + (session.duration_ms || 0);
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalTime,
      totalSessions,
      daysActive,
      categoryData,
      averagePerDay: daysActive > 0 ? totalTime / daysActive : 0
    };
  }, [currentMonth, sessions]);

  // Get upcoming deadlines (next 7 days)
  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    return timers
      .filter(timer => timer.deadline)
      .filter(timer => {
        const deadline = new Date(timer.deadline!);
        return isWithinInterval(deadline, { start: today, end: nextWeek });
      })
      .sort((a, b) => compareAsc(new Date(a.deadline!), new Date(b.deadline!)))
      .slice(0, 5);
  }, [timers]);

  // Get category colors for visualization
  const getCategoryColor = (index: number) => {
    const colors = ['hsl(221, 83%, 53%)', 'hsl(262, 80%, 55%)', 'hsl(291, 64%, 50%)', 'hsl(326, 72%, 48%)', 'hsl(354, 70%, 54%)'];
    return colors[index % colors.length];
  };

  // Calculate productivity trend (comparing to previous week)
  const productivityTrend = useMemo(() => {
    if (!selectedDate) return null;
    
    const currentWeekTime = getTotalTimeForDate(selectedDate, sessions);
    const lastWeekDate = addDays(selectedDate, -7);
    const lastWeekTime = getTotalTimeForDate(lastWeekDate, sessions);
    
    if (lastWeekTime === 0) return null;
    
    const change = ((currentWeekTime - lastWeekTime) / lastWeekTime) * 100;
    return { change, isPositive: change > 0 };
  }, [selectedDate, sessions]);

  return (
    <div className="space-y-4">
      {/* Monthly Performance Summary */}
      <Card className="glass-effect border border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" />
            {format(currentMonth, 'MMMM yyyy')} Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">
                {formatTime(monthlyData.totalTime)}
              </div>
              <div className="text-xs text-muted-foreground">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">
                {monthlyData.daysActive}
              </div>
              <div className="text-xs text-muted-foreground">Active Days</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Avg per Active Day</div>
            <div className="font-medium">{formatTime(monthlyData.averagePerDay)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="glass-effect border border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target size={16} className="text-primary" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(monthlyData.categoryData)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 4)
            .map(([category, time], index) => {
              const percentage = monthlyData.totalTime > 0 ? (time / monthlyData.totalTime) * 100 : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium truncate">{category}</span>
                    <span className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                    style={{ 
                      '--progress-background': getCategoryColor(index)
                    } as React.CSSProperties}
                  />
                </div>
              );
            })}
        </CardContent>
      </Card>

      {/* Productivity Trend */}
      {productivityTrend && (
        <Card className="glass-effect border border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              Weekly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-2">
              {productivityTrend.isPositive ? (
                <ArrowUp size={16} className="text-green-500" />
              ) : (
                <ArrowDown size={16} className="text-red-500" />
              )}
              <span className={`font-medium ${
                productivityTrend.isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {Math.abs(productivityTrend.change).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="glass-effect border border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs"
            onClick={() => onDateSelect(new Date())}
          >
            Go to Today
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-xs"
            onClick={() => onDateSelect(startOfMonth(new Date()))}
          >
            Go to This Month
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <Card className="glass-effect border border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingDeadlines.map((timer) => {
              const deadline = new Date(timer.deadline!);
              const isOverdue = isPast(deadline);
              
              return (
                <div key={timer.id} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    {isOverdue ? (
                      <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
                    ) : (
                      <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                    )}
                    <span className="text-xs font-medium truncate">{timer.name}</span>
                  </div>
                  <Badge 
                    variant={isOverdue ? "destructive" : "secondary"}
                    className="text-xs px-1 py-0"
                  >
                    {format(deadline, 'MMM d')}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarSidebar;
