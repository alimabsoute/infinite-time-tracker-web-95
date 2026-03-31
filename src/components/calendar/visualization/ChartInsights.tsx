
import React from 'react';
import { TimerSessionWithTimer } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';

interface ChartInsightsProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
}

const ChartInsights: React.FC<ChartInsightsProps> = ({ sessions, selectedCategory }) => {
  const generateInsights = () => {
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

    // Calculate metrics
    const totalTime = filteredSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
    const avgSessionTime = totalTime / filteredSessions.length;
    
    // Group by category
    const categoryStats: { [key: string]: { time: number; sessions: number } } = {};
    filteredSessions.forEach(session => {
      const category = session.timers?.category || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = { time: 0, sessions: 0 };
      }
      categoryStats[category].time += session.duration_ms || 0;
      categoryStats[category].sessions += 1;
    });

    const topCategory = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b.time - a.time)[0];

    // Generate insights
    const insights = [];
    const recommendations = [];

    // Total activity insight
    insights.push({
      icon: Activity,
      type: 'info',
      title: 'Total Activity',
      description: `${(totalTime / (1000 * 60 * 60)).toFixed(1)} hours logged across ${filteredSessions.length} sessions`
    });

    // Average session insight
    if (avgSessionTime > 2 * 60 * 60 * 1000) { // > 2 hours
      insights.push({
        icon: TrendingUp,
        type: 'positive',
        title: 'Long Focus Sessions',
        description: `Average session of ${(avgSessionTime / (1000 * 60)).toFixed(0)} minutes shows excellent focus`
      });
      recommendations.push({
        title: 'Maintain Momentum',
        description: 'Your long focus sessions are impressive. Consider adding short breaks to sustain this level.',
        priority: 'low'
      });
    } else if (avgSessionTime < 30 * 60 * 1000) { // < 30 minutes
      insights.push({
        icon: TrendingDown,
        type: 'warning',
        title: 'Short Sessions',
        description: `Average session of ${(avgSessionTime / (1000 * 60)).toFixed(0)} minutes could be improved`
      });
      recommendations.push({
        title: 'Extend Focus Time',
        description: 'Try the Pomodoro technique: 25-minute focused sessions with 5-minute breaks.',
        priority: 'high'
      });
    }

    // Category dominance
    if (topCategory) {
      const [categoryName, stats] = topCategory;
      const percentage = (stats.time / totalTime) * 100;
      
      if (percentage > 60) {
        insights.push({
          icon: Target,
          type: 'info',
          title: 'Category Focus',
          description: `${percentage.toFixed(0)}% of time spent on ${categoryName}`
        });
        recommendations.push({
          title: 'Diversify Activities',
          description: 'Consider balancing your time across different categories for well-rounded development.',
          priority: 'medium'
        });
      }
    }

    // Productivity pattern
    const recentSessions = filteredSessions.slice(-10);
    const recentAvg = recentSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0) / recentSessions.length;
    
    if (recentAvg > avgSessionTime * 1.2) {
      insights.push({
        icon: TrendingUp,
        type: 'positive',
        title: 'Improving Trend',
        description: 'Recent sessions are 20% longer than your average'
      });
    } else if (recentAvg < avgSessionTime * 0.8) {
      insights.push({
        icon: TrendingDown,
        type: 'warning',
        title: 'Declining Trend',
        description: 'Recent sessions are shorter than usual'
      });
      recommendations.push({
        title: 'Refresh Your Approach',
        description: 'Consider changing your environment or trying new productivity techniques.',
        priority: 'medium'
      });
    }

    return { insights, recommendations };
  };

  const { insights, recommendations } = generateInsights();

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
          <p>Generate some timer data to see personalized insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Smart Insights
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

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recommendations
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

export default ChartInsights;
