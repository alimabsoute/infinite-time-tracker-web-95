
import React from 'react';
import { TimerSessionWithTimer } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Users, Link, GitBranch, Layers } from 'lucide-react';

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
      return { insights: [], recommendations: [] };
    }

    const insights = [];
    const recommendations = [];

    // Group by timers and categories
    const timerGroups: { [key: string]: TimerSessionWithTimer[] } = {};
    const categoryGroups: { [key: string]: TimerSessionWithTimer[] } = {};
    
    filteredSessions.forEach(session => {
      const timerId = session.timer_id;
      const category = session.timers!.category || 'Uncategorized';
      
      if (!timerGroups[timerId]) timerGroups[timerId] = [];
      if (!categoryGroups[category]) categoryGroups[category] = [];
      
      timerGroups[timerId].push(session);
      categoryGroups[category].push(session);
    });

    const timerCount = Object.keys(timerGroups).length;
    const categoryCount = Object.keys(categoryGroups).length;

    // Network density analysis
    if (timerCount >= 5 && categoryCount >= 3) {
      insights.push({
        icon: Network,
        type: 'positive',
        title: 'Rich Activity Network',
        description: `${timerCount} timers across ${categoryCount} categories show diverse engagement`
      });
    } else if (timerCount <= 2) {
      insights.push({
        icon: GitBranch,
        type: 'warning',
        title: 'Limited Network',
        description: `Only ${timerCount} active timers - consider expanding your activity range`
      });
      recommendations.push({
        title: 'Expand Activity Network',
        description: 'Create timers for different types of activities to build a richer productivity network.',
        priority: 'medium'
      });
    }

    // Category clustering analysis
    const categoryStats = Object.entries(categoryGroups).map(([category, sessions]) => ({
      category,
      timerCount: new Set(sessions.map(s => s.timer_id)).size,
      totalTime: sessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0),
      sessionCount: sessions.length
    })).sort((a, b) => b.totalTime - a.totalTime);

    const dominantCategory = categoryStats[0];
    if (dominantCategory && dominantCategory.timerCount >= 3) {
      insights.push({
        icon: Layers,
        type: 'info',
        title: 'Category Hub Detected',
        description: `${dominantCategory.category} forms a major hub with ${dominantCategory.timerCount} connected timers`
      });
    }

    // Connection strength analysis
    const strongConnections = categoryStats.filter(cat => cat.timerCount >= 2 && cat.sessionCount >= 10);
    if (strongConnections.length >= 2) {
      insights.push({
        icon: Link,
        type: 'positive',
        title: 'Strong Category Connections',
        description: `${strongConnections.length} categories show robust internal connections`
      });
    }

    // Isolation detection
    const isolatedTimers = Object.entries(timerGroups).filter(([, sessions]) => sessions.length < 3);
    if (isolatedTimers.length > timerCount * 0.4) {
      insights.push({
        icon: Users,
        type: 'warning',
        title: 'Fragmented Network',
        description: `${isolatedTimers.length} timers show weak connections - consider consolidation`
      });
      recommendations.push({
        title: 'Strengthen Timer Connections',
        description: 'Focus on building regular usage patterns for existing timers rather than creating new ones.',
        priority: 'medium'
      });
    }

    // Network balance assessment
    const timeCentralization = dominantCategory.totalTime / filteredSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
    if (timeCentralization > 0.6) {
      insights.push({
        icon: Network,
        type: 'warning',
        title: 'Centralized Network',
        description: `${dominantCategory.category} dominates ${(timeCentralization * 100).toFixed(0)}% of network activity`
      });
      recommendations.push({
        title: 'Distribute Network Load',
        description: 'Consider balancing time across different categories for a more resilient productivity network.',
        priority: 'low'
      });
    } else if (timeCentralization < 0.4 && categoryCount >= 3) {
      insights.push({
        icon: Network,
        type: 'positive',
        title: 'Balanced Network',
        description: 'Well-distributed activity across multiple categories creates network resilience'
      });
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
          <p>Create multiple connected timers to see network insights</p>
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
              Network Structure Insights
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
              <GitBranch className="h-5 w-5" />
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
