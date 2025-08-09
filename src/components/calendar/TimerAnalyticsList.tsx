import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Timer, TimerSessionWithTimer } from '../../types';
import { formatTime } from './CalendarUtils';
import { BarChart3, TrendingUp, Clock } from 'lucide-react';
import { getCategoryColor } from './visualization/utils/ColorUtils';

interface TimerAnalyticsListProps {
  timers: Timer[];
  sessions: TimerSessionWithTimer[];
  currentMonth: Date;
}

const TimerAnalyticsList: React.FC<TimerAnalyticsListProps> = ({
  timers,
  sessions,
  currentMonth
}) => {
  const timerAnalytics = useMemo(() => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const monthSessions = sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return sessionDate >= monthStart && sessionDate <= monthEnd;
    });
    
    const timerStats = timers.map(timer => {
      const timerSessions = monthSessions.filter(session => session.timer_id === timer.id);
      const totalTime = timerSessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0);
      const sessionCount = timerSessions.length;
      const avgSessionTime = sessionCount > 0 ? totalTime / sessionCount : 0;
      
      return {
        ...timer,
        totalTime,
        sessionCount,
        avgSessionTime,
        efficiency: totalTime > 0 ? (sessionCount / (totalTime / (60 * 60 * 1000))) : 0 // sessions per hour
      };
    }).filter(timer => timer.totalTime > 0)
      .sort((a, b) => b.totalTime - a.totalTime);
    
    const totalMonthTime = timerStats.reduce((sum, timer) => sum + timer.totalTime, 0);
    
    return timerStats.map(timer => ({
      ...timer,
      percentage: totalMonthTime > 0 ? (timer.totalTime / totalMonthTime) * 100 : 0
    }));
  }, [timers, sessions, currentMonth]);

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 20) return 'text-green-600';
    if (percentage >= 10) return 'text-blue-600';
    if (percentage >= 5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 2) return { label: 'High', variant: 'default' as const };
    if (efficiency >= 1) return { label: 'Good', variant: 'secondary' as const };
    if (efficiency >= 0.5) return { label: 'Fair', variant: 'outline' as const };
    return { label: 'Low', variant: 'destructive' as const };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Timer Analytics
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Performance breakdown for {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </CardHeader>
      
      <CardContent>
        {timerAnalytics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No timer activity this month</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timerAnalytics.slice(0, 8).map((timer, index) => {
              const efficiencyBadge = getEfficiencyBadge(timer.efficiency);
              
              return (
                <div key={timer.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-1 h-8 rounded-full flex-shrink-0`} 
                           style={{ backgroundColor: getCategoryColor(timer.category || 'Uncategorized', false) }} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">{timer.name}</h4>
                          <Badge variant={efficiencyBadge.variant} className="text-xs">
                            {efficiencyBadge.label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{timer.sessionCount} sessions</span>
                          <span>Avg: {formatTime(timer.avgSessionTime)}</span>
                          {timer.category && (
                            <Badge variant="outline" className="text-xs">
                              {timer.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <div className={`font-bold ${getPerformanceColor(timer.percentage)}`}>
                        {formatTime(timer.totalTime)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {timer.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <Progress value={timer.percentage} className="h-2" />
                  
                  {index < timerAnalytics.length - 1 && (
                    <div className="border-b border-border/30 pt-2" />
                  )}
                </div>
              );
            })}
            
            {timerAnalytics.length > 8 && (
              <div className="text-center pt-2">
                <Badge variant="secondary" className="text-xs">
                  +{timerAnalytics.length - 8} more timers
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimerAnalyticsList;