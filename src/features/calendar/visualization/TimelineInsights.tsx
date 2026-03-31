
import React from 'react';
import { TimerSessionWithTimer } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar, Clock, Zap } from 'lucide-react';
import { format, parseISO, isWeekend } from 'date-fns';

interface TimelineInsightsProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
}

const TimelineInsights: React.FC<TimelineInsightsProps> = ({ sessions, selectedCategory }) => {
  const generateTimelineInsights = () => {
    const filteredSessions = sessions.filter(session => 
      session.duration_ms && 
      session.timers &&
      session.start_time &&
      (!selectedCategory || selectedCategory === 'all' || session.timers.category === selectedCategory)
    );

    if (filteredSessions.length === 0) {
      return { insights: [], recommendations: [] };
    }

    const insights = [];
    const recommendations = [];

    // Group sessions by day
    const dayGroups: { [key: string]: TimerSessionWithTimer[] } = {};
    filteredSessions.forEach(session => {
      try {
        const sessionDate = parseISO(session.start_time!);
        const dayKey = format(sessionDate, 'yyyy-MM-dd');
        if (!dayGroups[dayKey]) dayGroups[dayKey] = [];
        dayGroups[dayKey].push(session);
      } catch (error) {
        console.warn('Invalid session date:', session.start_time);
      }
    });

    const dailyTotals = Object.entries(dayGroups).map(([day, sessions]) => ({
      day,
      date: parseISO(day),
      totalTime: sessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0),
      sessionCount: sessions.length
    })).sort((a, b) => a.date.getTime() - b.date.getTime());

    // Consistency analysis
    const avgDailyTime = dailyTotals.reduce((sum, d) => sum + d.totalTime, 0) / dailyTotals.length;
    const consistentDays = dailyTotals.filter(d => Math.abs(d.totalTime - avgDailyTime) < avgDailyTime * 0.3).length;
    const consistencyRate = consistentDays / dailyTotals.length;

    if (consistencyRate > 0.7) {
      insights.push({
        icon: TrendingUp,
        type: 'positive',
        title: 'Consistent Daily Pattern',
        description: `${(consistencyRate * 100).toFixed(0)}% of days show consistent activity levels`
      });
    } else if (consistencyRate < 0.4) {
      insights.push({
        icon: TrendingDown,
        type: 'warning',
        title: 'Irregular Activity Pattern',
        description: `Only ${(consistencyRate * 100).toFixed(0)}% of days are consistent - consider establishing routine`
      });
      recommendations.push({
        title: 'Establish Daily Routine',
        description: 'Try to maintain similar activity levels each day for better habit formation.',
        priority: 'high'
      });
    }

    // Peak day analysis
    const sortedDays = [...dailyTotals].sort((a, b) => b.totalTime - a.totalTime);
    const peakDay = sortedDays[0];
    if (peakDay && peakDay.totalTime > avgDailyTime * 1.5) {
      const dayName = format(peakDay.date, 'EEEE');
      insights.push({
        icon: Zap,
        type: 'info',
        title: 'Peak Performance Day',
        description: `${dayName} shows exceptional activity with ${(peakDay.totalTime / (1000 * 60 * 60)).toFixed(1)} hours`
      });
    }

    // Weekend vs weekday analysis
    const weekdaySessions = dailyTotals.filter(d => !isWeekend(d.date));
    const weekendSessions = dailyTotals.filter(d => isWeekend(d.date));
    
    if (weekdaySessions.length > 0 && weekendSessions.length > 0) {
      const weekdayAvg = weekdaySessions.reduce((sum, d) => sum + d.totalTime, 0) / weekdaySessions.length;
      const weekendAvg = weekendSessions.reduce((sum, d) => sum + d.totalTime, 0) / weekendSessions.length;
      
      if (weekendAvg > weekdayAvg * 1.3) {
        insights.push({
          icon: Calendar,
          type: 'info',
          title: 'Weekend Warrior',
          description: 'Weekend activity is 30% higher than weekdays'
        });
        recommendations.push({
          title: 'Balance Weekday Activity',
          description: 'Consider increasing weekday focus time to maintain momentum.',
          priority: 'medium'
        });
      } else if (weekdayAvg > weekendAvg * 1.5) {
        insights.push({
          icon: Clock,
          type: 'positive',
          title: 'Strong Weekday Focus',
          description: 'Consistent weekday productivity with good work-life balance'
        });
      }
    }

    // Recent trend analysis
    if (dailyTotals.length >= 7) {
      const recentDays = dailyTotals.slice(-3);
      const earlierDays = dailyTotals.slice(-7, -3);
      
      const recentAvg = recentDays.reduce((sum, d) => sum + d.totalTime, 0) / recentDays.length;
      const earlierAvg = earlierDays.reduce((sum, d) => sum + d.totalTime, 0) / earlierDays.length;
      
      if (recentAvg > earlierAvg * 1.2) {
        insights.push({
          icon: TrendingUp,
          type: 'positive',
          title: 'Improving Trend',
          description: 'Activity increased 20% in recent days'
        });
      } else if (recentAvg < earlierAvg * 0.8) {
        insights.push({
          icon: TrendingDown,
          type: 'warning',
          title: 'Declining Activity',
          description: 'Recent activity down 20% from earlier period'
        });
        recommendations.push({
          title: 'Revitalize Your Routine',
          description: 'Consider what might be affecting your recent productivity and adjust accordingly.',
          priority: 'medium'
        });
      }
    }

    return { insights, recommendations };
  };

  const { insights, recommendations } = generateTimelineInsights();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  if (insights.length === 0 && recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Generate timeline data to see temporal insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline Pattern Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getTypeColor(insight.type)}`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm opacity-80">{insight.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Timeline Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Temporal Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-3 rounded-lg bg-muted/30 border">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium flex items-center gap-2">
                      {rec.title}
                      <Badge variant={getPriorityVariant(rec.priority)} className="text-xs">
                        {rec.priority}
                      </Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TimelineInsights;
