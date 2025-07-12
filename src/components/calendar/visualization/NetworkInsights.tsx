
import React from 'react';
import { TimerSessionWithTimer } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Users, Link, Zap, GitBranch } from 'lucide-react';

interface NetworkInsightsProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
}

const NetworkInsights: React.FC<NetworkInsightsProps> = ({ sessions, selectedCategory }) => {
  const generateNetworkInsights = () => {
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

    // Group by timer and category
    const timerGroups: { [key: string]: TimerSessionWithTimer[] } = {};
    const categoryGroups: { [key: string]: string[] } = {};

    filteredSessions.forEach(session => {
      const timerId = session.timer_id;
      const category = session.timers?.category || 'Uncategorized';
      
      if (!timerGroups[timerId]) {
        timerGroups[timerId] = [];
      }
      timerGroups[timerId].push(session);

      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      if (!categoryGroups[category].includes(timerId)) {
        categoryGroups[category].push(timerId);
      }
    });

    const insights = [];
    const recommendations = [];

    // Network connectivity analysis
    const totalTimers = Object.keys(timerGroups).length;
    const totalCategories = Object.keys(categoryGroups).length;
    
    insights.push({
      icon: Network,
      type: 'info',
      title: 'Network Overview',
      description: `${totalTimers} active timers across ${totalCategories} categories`
    });

    // Category clustering analysis
    const categoryConnections = Object.entries(categoryGroups).map(([category, timers]) => ({
      category,
      timerCount: timers.length,
      totalSessions: timers.reduce((sum, timerId) => sum + (timerGroups[timerId]?.length || 0), 0)
    })).sort((a, b) => b.timerCount - a.timerCount);

    const mostConnectedCategory = categoryConnections[0];
    if (mostConnectedCategory && mostConnectedCategory.timerCount > 1) {
      insights.push({
        icon: Users,
        type: 'positive',
        title: 'Strong Category Network',
        description: `${mostConnectedCategory.category} has ${mostConnectedCategory.timerCount} connected timers`
      });
    }

    // Isolated vs Connected timers
    const isolatedTimers = Object.entries(timerGroups).filter(([timerId, sessions]) => {
      const category = sessions[0]?.timers?.category || 'Uncategorized';
      return categoryGroups[category]?.length === 1;
    });

    if (isolatedTimers.length > 0) {
      insights.push({
        icon: GitBranch,
        type: 'warning',
        title: 'Isolated Activities',
        description: `${isolatedTimers.length} timers in single-timer categories`
      });
      
      if (isolatedTimers.length > totalTimers * 0.4) {
        recommendations.push({
          title: 'Group Related Activities',
          description: 'Consider organizing similar timers into shared categories for better insights.',
          priority: 'medium'
        });
      }
    }

    // Network density analysis
    const possibleConnections = totalCategories * (totalCategories - 1) / 2;
    const actualConnections = categoryConnections.filter(cat => cat.timerCount > 1).length;
    const networkDensity = totalCategories > 1 ? (actualConnections / totalCategories) * 100 : 0;

    if (networkDensity > 60) {
      insights.push({
        icon: Link,
        type: 'positive',
        title: 'Dense Network',
        description: `High connectivity with ${networkDensity.toFixed(0)}% of categories well-connected`
      });
    } else if (networkDensity < 30 && totalCategories > 2) {
      insights.push({
        icon: Link,
        type: 'warning',
        title: 'Sparse Network',
        description: `Low connectivity - consider consolidating related activities`
      });
      recommendations.push({
        title: 'Strengthen Connections',
        description: 'Add more timers to existing categories or merge similar categories.',
        priority: 'low'
      });
    }

    // Activity hub analysis
    const sessionDistribution = Object.entries(timerGroups).map(([timerId, sessions]) => ({
      timerId,
      timerName: sessions[0]?.timers?.name || 'Unknown',
      sessionCount: sessions.length,
      category: sessions[0]?.timers?.category || 'Uncategorized'
    })).sort((a, b) => b.sessionCount - a.sessionCount);

    const topTimer = sessionDistribution[0];
    if (topTimer && topTimer.sessionCount > sessionDistribution.length * 0.3) {
      insights.push({
        icon: Zap,
        type: 'info',
        title: 'Activity Hub',
        description: `${topTimer.timerName} is your most active node with ${topTimer.sessionCount} sessions`
      });
    }

    // Network balance
    if (sessionDistribution.length > 3) {
      const topThirdCount = Math.ceil(sessionDistribution.length / 3);
      const topThirdSessions = sessionDistribution.slice(0, topThirdCount)
        .reduce((sum, timer) => sum + timer.sessionCount, 0);
      const totalSessions = sessionDistribution.reduce((sum, timer) => sum + timer.sessionCount, 0);
      const concentration = (topThirdSessions / totalSessions) * 100;

      if (concentration > 80) {
        insights.push({
          icon: GitBranch,
          type: 'warning',
          title: 'Concentrated Activity',
          description: `${concentration.toFixed(0)}% of sessions in top ${topThirdCount} timers`
        });
        recommendations.push({
          title: 'Distribute Activity',
          description: 'Try to engage more with underutilized timers for a more balanced network.',
          priority: 'low'
        });
      }
    }

    return { insights, recommendations };
  };

  const { insights, recommendations } = generateNetworkInsights();

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
          <p>Generate network data to see relationship insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Network Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Network className="h-5 w-5" />
              Network Relationship Insights
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

      {/* Network Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Network Optimization
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

export default NetworkInsights;
