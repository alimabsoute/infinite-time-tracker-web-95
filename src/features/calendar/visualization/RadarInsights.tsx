
import React from 'react';
import { TimerSessionWithTimer } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Target, TrendingUp, TrendingDown, BarChart, Award } from 'lucide-react';

interface RadarInsightsProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
}

const RadarInsights: React.FC<RadarInsightsProps> = ({ sessions, selectedCategory }) => {
  const generateRadarInsights = () => {
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

    const categoryStats: { [key: string]: { time: number; sessions: number; avgSession: number } } = {};
    
    filteredSessions.forEach(session => {
      const category = session.timers?.category || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = { time: 0, sessions: 0, avgSession: 0 };
      }
      categoryStats[category].time += session.duration_ms || 0;
      categoryStats[category].sessions += 1;
    });

    // Calculate averages
    Object.keys(categoryStats).forEach(category => {
      categoryStats[category].avgSession = categoryStats[category].time / categoryStats[category].sessions;
    });

    const insights = [];
    const recommendations = [];

    // Category balance analysis
    const categories = Object.keys(categoryStats);
    const totalTime = Object.values(categoryStats).reduce((sum, stats) => sum + stats.time, 0);
    
    if (categories.length === 1) {
      insights.push({
        icon: TrendingDown,
        type: 'warning',
        title: 'Single Category Focus',
        description: `All time spent on ${categories[0]} - consider diversifying activities`
      });
      recommendations.push({
        title: 'Explore New Categories',
        description: 'Try adding timers for different types of activities to create a more balanced routine.',
        priority: 'medium'
      });
    } else if (categories.length >= 4) {
      insights.push({
        icon: Award,
        type: 'positive',
        title: 'Well-Balanced Portfolio',
        description: `Active across ${categories.length} categories showing good diversification`
      });
    }

    // Dominant category analysis
    const sortedCategories = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b.time - a.time);
    
    const topCategory = sortedCategories[0];
    if (topCategory) {
      const [categoryName, stats] = topCategory;
      const percentage = (stats.time / totalTime) * 100;
      
      if (percentage > 80) {
        insights.push({
          icon: Target,
          type: 'warning',
          title: 'Over-Concentration',
          description: `${percentage.toFixed(0)}% focus on ${categoryName} may indicate imbalance`
        });
        recommendations.push({
          title: 'Diversify Time Allocation',
          description: 'Consider allocating some time to other important areas of your life.',
          priority: 'high'
        });
      } else if (percentage > 50) {
        insights.push({
          icon: Target,
          type: 'info',
          title: 'Primary Focus Area',
          description: `${categoryName} represents ${percentage.toFixed(0)}% of your tracked time`
        });
      }
    }

    // Session efficiency analysis
    const avgSessionTimes = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      avgMinutes: stats.avgSession / (1000 * 60)
    }));

    const mostEfficientCategory = avgSessionTimes.reduce((best, current) => 
      current.avgMinutes > best.avgMinutes ? current : best
    );

    const leastEfficientCategory = avgSessionTimes.reduce((worst, current) => 
      current.avgMinutes < worst.avgMinutes ? current : worst
    );

    if (mostEfficientCategory.avgMinutes > 60) {
      insights.push({
        icon: TrendingUp,
        type: 'positive',
        title: 'Deep Focus Sessions',
        description: `${mostEfficientCategory.category}: ${mostEfficientCategory.avgMinutes.toFixed(0)}min average sessions`
      });
    }

    if (leastEfficientCategory.avgMinutes < 30 && avgSessionTimes.length > 1) {
      insights.push({
        icon: TrendingDown,
        type: 'warning',
        title: 'Short Session Pattern',
        description: `${leastEfficientCategory.category}: only ${leastEfficientCategory.avgMinutes.toFixed(0)}min average`
      });
      recommendations.push({
        title: 'Extend Focus Time',
        description: `Try to extend ${leastEfficientCategory.category} sessions using techniques like time-blocking.`,
        priority: 'medium'
      });
    }

    // Performance comparison
    if (categories.length > 2) {
      const performanceGap = sortedCategories[0][1].time - sortedCategories[sortedCategories.length - 1][1].time;
      const gapHours = performanceGap / (1000 * 60 * 60);
      
      if (gapHours > 10) {
        insights.push({
          icon: BarChart,
          type: 'info',
          title: 'Performance Gap',
          description: `${gapHours.toFixed(1)}h difference between highest and lowest categories`
        });
      }
    }

    return { insights, recommendations };
  };

  const { insights, recommendations } = generateRadarInsights();

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
          <p>Generate multi-category data to see radar chart insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Radar Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Category Performance Insights
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

      {/* Radar Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Balance Recommendations
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

export default RadarInsights;
