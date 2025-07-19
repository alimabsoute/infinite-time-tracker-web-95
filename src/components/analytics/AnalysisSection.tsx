import React from 'react';
import { TimerSessionWithTimer } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TreePine, PieChart, BarChart3, TrendingUp, Target } from 'lucide-react';

interface AnalysisSectionProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({ sessions, selectedCategory }) => {
  const generateInsights = () => {
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

    const insights = [];

    // Hierarchical structure analysis
    insights.push({
      icon: TreePine,
      type: 'info',
      title: 'Hierarchical Structure',
      description: `${categoryCount} categories with ${categories.reduce((sum, [, stats]) => sum + stats.timers.size, 0)} unique timers`
    });

    // Category dominance analysis
    if (topCategory) {
      const [categoryName, stats] = topCategory;
      const percentage = (stats.time / totalTime) * 100;
      
      if (percentage > 70) {
        insights.push({
          icon: PieChart,
          type: 'warning',
          title: 'High Category Concentration',
          description: `${categoryName} dominates ${percentage.toFixed(0)}% of your time`
        });
      } else if (percentage < 30) {
        insights.push({
          icon: BarChart3,
          type: 'positive',
          title: 'Well-Distributed Time',
          description: `Top category (${categoryName}) is only ${percentage.toFixed(0)}% - good balance!`
        });
      }
    }

    // Diversity analysis
    if (diversityScore > 0.7) {
      insights.push({
        icon: TrendingUp,
        type: 'positive',
        title: 'High Activity Diversity',
        description: `Excellent balance across ${categoryCount} categories`
      });
    } else if (diversityScore < 0.3) {
      insights.push({
        icon: Target,
        type: 'warning',
        title: 'Low Activity Diversity',
        description: 'Time is concentrated in few categories'
      });
    }

    // Session distribution analysis
    const avgSessionsPerTimer = filteredSessions.length / categories.reduce((sum, [, stats]) => sum + stats.timers.size, 0);
    if (avgSessionsPerTimer < 2) {
      insights.push({
        icon: BarChart3,
        type: 'info',
        title: 'Many One-Time Activities',
        description: 'Most timers used infrequently - exploring many areas'
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800';
      default: return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800';
    }
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Start timing activities to see insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TreePine className="h-5 w-5" />
          Activity Analysis
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
  );
};

export default AnalysisSection;