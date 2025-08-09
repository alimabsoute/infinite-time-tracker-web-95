import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Timer, TimerSessionWithTimer } from '../../types';
import { getTotalTimeForDate, formatTime } from './CalendarUtils';
import { Clock, Target, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';

interface MonthlySummaryCardProps {
  currentMonth: Date;
  sessions: TimerSessionWithTimer[];
  timers: Timer[];
}

const MonthlySummaryCard: React.FC<MonthlySummaryCardProps> = ({
  currentMonth,
  sessions,
  timers
}) => {
  const monthlyStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    let totalTime = 0;
    let activeDays = 0;
    const categoryBreakdown: Record<string, number> = {};
    
    daysInMonth.forEach(day => {
      const dayTime = getTotalTimeForDate(day, sessions);
      totalTime += dayTime;
      
      if (dayTime > 0) {
        activeDays++;
      }
      
      // Calculate category breakdown
      const daySessions = sessions.filter(session => {
        const sessionDate = new Date(session.start_time);
        return sessionDate.toDateString() === day.toDateString();
      });
      
      daySessions.forEach(session => {
        const category = session.timers?.category || 'Uncategorized';
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + (session.duration_ms || 0);
      });
    });
    
    const categoryPercentages = Object.entries(categoryBreakdown)
      .map(([category, time]) => ({
        category,
        time,
        percentage: totalTime > 0 ? (time / totalTime) * 100 : 0
      }))
      .sort((a, b) => b.time - a.time);
    
    return {
      totalTime,
      activeDays,
      totalDays: daysInMonth.length,
      categoryPercentages,
      averagePerDay: activeDays > 0 ? totalTime / activeDays : 0
    };
  }, [currentMonth, sessions]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Work': 'bg-blue-500',
      'Personal': 'bg-green-500', 
      'Study': 'bg-purple-500',
      'Exercise': 'bg-red-500',
      'Health': 'bg-pink-500',
      'Learning': 'bg-cyan-500',
      'Uncategorized': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Monthly Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Total Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Time</span>
            </div>
            <span className="text-2xl font-bold">{formatTime(monthlyStats.totalTime)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Active Days: {monthlyStats.activeDays}/{monthlyStats.totalDays}</span>
            <span>Avg/Day: {formatTime(monthlyStats.averagePerDay)}</span>
          </div>
          
          <Progress 
            value={(monthlyStats.activeDays / monthlyStats.totalDays) * 100} 
            className="h-2"
          />
        </div>
        
        {/* Category Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Category Breakdown</span>
          </div>
          
          {monthlyStats.categoryPercentages.slice(0, 5).map(({ category, time, percentage }) => (
            <div key={category} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`} />
                  <span>{category}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatTime(time)}</div>
                  <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                </div>
              </div>
              <Progress value={percentage} className="h-1" />
            </div>
          ))}
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{timers.length}</div>
            <div className="text-xs text-muted-foreground">Total Timers</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{sessions.length}</div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlySummaryCard;