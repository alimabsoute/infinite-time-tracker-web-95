
import React from 'react';
import { TimerSessionWithTimer } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import { format, parseISO, startOfDay, differenceInDays } from 'date-fns';

interface TimelineInsightsProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
}

const TimelineInsights: React.FC<TimelineInsightsProps> = ({ sessions, selectedCategory }) => {
  const generateTimelineInsights = () => {
    const filteredSessions = sessions.filter(session => 
      session.duration_ms && 
      session.timers &&
      (!selectedCategory || selectedCategory === 'all' || session.timers.category === selectedCategory)
    );

    if (filteredSessions.length === 0) {
      return {
        insights: [],
        recommendations: []
      };
    }

    // Group sessions by day
    const dailyData: { [key: string]: { sessions: TimerSessionWithTimer[]; totalTime: number } } = {};
    filteredSessions.forEach(session => {
      const day = format(startOfDay(parseISO(session.start_time)), 'yyyy-MM-dd');
      if (!dailyData[day]) {
        dailyData[day] = { sessions: [], totalTime: 0 };
      }
      dailyData[day].sessions.push(session);
      dailyData[day].totalTime += session.duration_ms || 0;
    });

    const dailyEntries = Object.entries(dailyData).sort(([a], [b]) => a.localeCompare(b));
    const insights = [];
    const recommendations = [];

    // Activity consistency analysis
    const activeDays = dailyEntries.length;
    const avgDailyTime = dailyEntries.reduce((sum, [, data]) => sum + data.totalTime, 0) / activeDays;
    const totalDays = differenceInDays(new Date(), parseISO(dailyEntries[0]?.[0] || new Date().toISOString())) + 1;
    const consistencyRate = (activeDays / totalDays) * 100;

    if (consistencyRate > 70) {
      insights.push({
        icon: TrendingUp,
        type: 'positive',
        title: 'High Consistency',
        description: `Active ${consistencyRate.toFixed(0)}% of days with ${(avgDailyTime / (1000 * 60 * 60)).toFixed(1)}h average`
      });
    } else if (consistencyRate < 40) {
      insights.push({
        icon: TrendingDown,
        type: 'warning',
        title: 'Inconsistent Activity',
        description: `Only active ${consistencyRate.toFixed(0)}% of days - room for improvement`
      });
      recommendations.push({
        title: 'Build Daily Habits',
        description: 'Try setting a small daily goal (15-30 minutes) to build consistency.',
        priority: 'high'
      });
    }

    // Peak activity analysis
    const bestDay = dailyEntries.reduce((best, [day, data]) => 
      data.totalTime > best.totalTime ? { day, ...data } : best, 
      { day: '', totalTime: 0, sessions: [] }
    );

    if (bestDay.totalTime > 0) {
      insights.push({
        icon: Activity,
        type: 'info',
        title: 'Peak Performance',
        description: `Best day: ${(bestDay.totalTime / (1000 * 60 * 60)).toFixed(1)}h across ${bestDay.sessions.length} sessions`
      });
    }

    // Weekly pattern analysis
    const recentDays = dailyEntries.slice(-7);
    const recentAvg = recentDays.reduce((sum, [, data]) => sum + data.totalTime, 0) / recentDays.length;
    const overallAvg = avgDailyTime;

    if (recentAvg > overallAvg * 1.2) {
      insights.push({
        icon: TrendingUp,
        type: 'positive',
        title: 'Recent Improvement',
        description: 'Last week shows 20% increase in daily activity'
      });
    } else if (recentAvg < overallAvg * 0.8) {
      insights.push({
        icon: TrendingDown,
        type: 'warning',
        title: 'Recent Decline',
        description: 'Activity has decreased in recent days'
      });
      recommendations.push({
        title: 'Reengage Your Routine',
        description: 'Consider reviewing what worked well in your most productive periods.',
        priority: 'medium'
      });
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
          <p>Generate timeline data to see activity pattern insights</p>
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
              Timeline Insights
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
              Activity Recommendations
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
