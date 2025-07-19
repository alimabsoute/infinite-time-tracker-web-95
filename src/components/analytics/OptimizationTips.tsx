import React from 'react';
import { TimerSessionWithTimer } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from 'lucide-react';

interface OptimizationTipsProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
}

const OptimizationTips: React.FC<OptimizationTipsProps> = ({ sessions, selectedCategory }) => {
  const generateRecommendations = () => {
    const filteredSessions = sessions.filter(session => 
      session.duration_ms && 
      session.timers &&
      (!selectedCategory || selectedCategory === 'all' || session.timers.category === selectedCategory)
    );

    if (filteredSessions.length === 0) {
      return [];
    }

    // Calculate hierarchical structure insights
    const totalTime = filteredSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
    
    // Group by category
    const categoryStats: { [key: string]: { time: number; sessions: number; timers: Set<string> } } = {};
    filteredSessions.forEach(session => {
      const category = session.timers?.category || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = { time: 0, sessions: 0, timers: new Set() };
      }
      categoryStats[category].time += session.duration_ms || 0;
      categoryStats[category].sessions += 1;
      categoryStats[category].timers.add(session.timer_id);
    });

    // Calculate distribution metrics
    const categories = Object.entries(categoryStats).sort(([,a], [,b]) => b.time - a.time);
    const topCategory = categories[0];
    const categoryCount = categories.length;
    
    // Calculate diversity score (how evenly distributed time is)
    const timeDistribution = categories.map(([, stats]) => stats.time / totalTime);
    const diversityScore = 1 - timeDistribution.reduce((sum, p) => sum + p * p, 0);

    const recommendations = [];

    // Category dominance analysis
    if (topCategory) {
      const [categoryName, stats] = topCategory;
      const percentage = (stats.time / totalTime) * 100;
      
      if (percentage > 70) {
        recommendations.push({
          title: 'Balance Your Activities',
          description: 'Consider diversifying your time across more categories for a more balanced approach.',
          priority: 'medium'
        });
      }
    }

    // Diversity analysis
    if (diversityScore < 0.3) {
      recommendations.push({
        title: 'Explore New Areas',
        description: 'Try allocating time to different categories to develop a more diverse skill set.',
        priority: 'low'
      });
    }

    // Timer count per category analysis
    const avgTimersPerCategory = categories.reduce((sum, [, stats]) => sum + stats.timers.size, 0) / categoryCount;
    if (avgTimersPerCategory > 5) {
      recommendations.push({
        title: 'Consider Timer Consolidation',
        description: 'You have many timers per category. Consider consolidating similar activities.',
        priority: 'low'
      });
    } else if (avgTimersPerCategory < 2) {
      recommendations.push({
        title: 'Expand Timer Usage',
        description: 'Consider creating more specific timers within categories for better tracking granularity.',
        priority: 'low'
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Continue timing activities to get optimization tips</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5" />
          Optimization Tips
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
  );
};

export default OptimizationTips;