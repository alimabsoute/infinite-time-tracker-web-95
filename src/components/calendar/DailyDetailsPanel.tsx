import React, { useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Timer, TimerSessionWithTimer } from '../../types';
import { getSessionsForDate, getTotalTimeForDate, formatTime } from './CalendarUtils';
import { Calendar as CalendarIcon, Clock, Target, TrendingUp, BarChart3 } from 'lucide-react';
import { getCategoryColor } from './visualization/utils/ColorUtils';

interface DailyDetailsPanelProps {
  selectedDate: Date | undefined;
  sessions: TimerSessionWithTimer[];
  timers: Timer[];
}

const DailyDetailsPanel: React.FC<DailyDetailsPanelProps> = ({
  selectedDate,
  sessions,
}) => {
  const dailyData = useMemo(() => {
    if (!selectedDate) return null;
    
    const daySessions = getSessionsForDate(selectedDate, sessions);
    const totalTime = getTotalTimeForDate(selectedDate, sessions);
    
    // Group sessions by timer
    const sessionsByTimer = daySessions.reduce((acc, session) => {
      const timerId = session.timer_id;
      if (!acc[timerId]) {
        acc[timerId] = {
          timer: session.timers,
          sessions: [],
          totalTime: 0
        };
      }
      acc[timerId].sessions.push(session);
      acc[timerId].totalTime += session.duration_ms || 0;
      return acc;
    }, {} as Record<string, { timer: any, sessions: TimerSessionWithTimer[], totalTime: number }>);
    
    // Convert to array and sort by time
    const timerSummaries = Object.values(sessionsByTimer)
      .sort((a, b) => b.totalTime - a.totalTime);
    
    // Category breakdown
    const categoryBreakdown = daySessions.reduce((acc, session) => {
      const category = session.timers?.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + (session.duration_ms || 0);
      return acc;
    }, {} as Record<string, number>);
    
    const categoryStats = Object.entries(categoryBreakdown)
      .map(([category, time]) => ({
        category,
        time,
        percentage: totalTime > 0 ? (time / totalTime) * 100 : 0
      }))
      .sort((a, b) => b.time - a.time);
    
    // Time distribution analysis
    const hourlyDistribution: Record<number, number> = {};
    daySessions.forEach(session => {
      const hour = new Date(session.start_time).getHours();
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + (session.duration_ms || 0);
    });
    
    const peakHour = Object.entries(hourlyDistribution)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
    return {
      totalTime,
      sessionCount: daySessions.length,
      timerSummaries,
      categoryStats,
      avgSessionTime: daySessions.length > 0 ? totalTime / daySessions.length : 0,
      peakHour: peakHour ? `${peakHour[0]}:00` : null,
      peakHourTime: peakHour ? (peakHour[1] as number) : 0
    };
  }, [selectedDate, sessions]);

  if (!selectedDate) {
    return (
      <Card className="h-fit">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Select a date to view details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dailyData || dailyData.sessionCount === 0) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-lg">
            {format(selectedDate, 'EEEE, MMM d')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activity on this day</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          {isToday ? 'Today' : format(selectedDate, 'EEEE, MMM d')}
        </CardTitle>
        {isToday && (
          <p className="text-sm text-muted-foreground">Daily Standup</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Daily Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{formatTime(dailyData.totalTime)}</div>
            <div className="text-xs text-muted-foreground">Total Time</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{dailyData.sessionCount}</div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-500" />
              Avg Session
            </span>
            <span className="font-medium">{formatTime(dailyData.avgSessionTime)}</span>
          </div>
          
          {dailyData.peakHour && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                Peak Hour
              </span>
              <span className="font-medium">{dailyData.peakHour} ({formatTime(dailyData.peakHourTime)})</span>
            </div>
          )}
        </div>
        
        {/* Category Breakdown */}
        {dailyData.categoryStats.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Categories</span>
            </div>
            
            {dailyData.categoryStats.slice(0, 4).map(({ category, time, percentage }) => (
              <div key={category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" 
                         style={{ backgroundColor: getCategoryColor(category, false) }} />
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
        )}
        
        {/* Timer Breakdown */}
        {dailyData.timerSummaries.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Timer Activity</h4>
            
            {dailyData.timerSummaries.slice(0, 5).map(({ timer, sessions, totalTime }) => (
              <div key={timer?.id || 'unknown'} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-2 h-2 rounded-full" 
                       style={{ backgroundColor: getCategoryColor(timer?.category || 'Uncategorized', false) }} />
                  <span className="truncate">{timer?.name || 'Unknown Timer'}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-medium">{formatTime(totalTime)}</div>
                  <div className="text-xs text-muted-foreground">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
            ))}
            
            {dailyData.timerSummaries.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{dailyData.timerSummaries.length - 5} more timers
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyDetailsPanel;