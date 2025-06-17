
import React from 'react';
import { Timer, TimerSessionWithTimer } from '../../types';
import { useProductivityInsights } from '../../hooks/useProductivityInsights';
import InsightCard from './InsightCard';
import InsightRecommendations from './InsightRecommendations';
import { Clock, TrendingUp, Target, Zap, Calendar, BarChart3 } from 'lucide-react';
import { formatTime } from '../timer/TimerUtils';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

interface QuickInsightsDashboardProps {
  timers: Timer[];
  sessions: TimerSessionWithTimer[];
}

const QuickInsightsDashboard: React.FC<QuickInsightsDashboardProps> = ({ 
  timers, 
  sessions 
}) => {
  const insights = useProductivityInsights(timers, sessions);

  // Generate insight data
  const insightCards = [
    {
      headline: "Your productivity is trending upward",
      takeaway: `You've increased your focus time by ${Math.abs(insights.weeklyGrowth).toFixed(1)}% this week`,
      comparison: `vs last week (${formatTime(insights.totalTimeLastWeek)})`,
      value: `+${insights.weeklyGrowth.toFixed(1)}%`,
      icon: TrendingUp,
      color: insights.weeklyGrowth >= 0 ? 'text-green-500' : 'text-red-500',
      bgColor: insights.weeklyGrowth >= 0 ? 'bg-green-50' : 'bg-red-50',
      actionable: insights.weeklyGrowth < 10
    },
    {
      headline: "Peak performance window identified",
      takeaway: `You're most productive at ${insights.mostProductiveHour}:00`,
      comparison: `Schedule important work during this time`,
      value: `${insights.mostProductiveHour}:00`,
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      actionable: true
    },
    {
      headline: `Your ${insights.mostProductiveDay} momentum`,
      takeaway: `${insights.mostProductiveDay}s are your strongest productivity days`,
      comparison: "Plan challenging tasks for this day",
      value: insights.mostProductiveDay,
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      actionable: true
    },
    {
      headline: "Session quality analysis",
      takeaway: `Your average session length is ${formatTime(insights.averageSessionTime)}`,
      comparison: `${insights.completionRate.toFixed(1)}% of sessions have meaningful progress`,
      value: formatTime(insights.averageSessionTime),
      icon: Target,
      color: insights.averageSessionTime >= 25 * 60 * 1000 ? 'text-green-500' : 'text-yellow-500',
      bgColor: insights.averageSessionTime >= 25 * 60 * 1000 ? 'bg-green-50' : 'bg-yellow-50',
      actionable: insights.averageSessionTime < 20 * 60 * 1000
    },
    {
      headline: "Consistency score",
      takeaway: `You've been active ${insights.dailyTrend.filter(d => d.time > 0).length} out of 7 days`,
      comparison: "Consistency is key to building momentum",
      value: `${insights.dailyTrend.filter(d => d.time > 0).length}/7 days`,
      icon: BarChart3,
      color: insights.dailyTrend.filter(d => d.time > 0).length >= 5 ? 'text-green-500' : 'text-yellow-500',
      bgColor: insights.dailyTrend.filter(d => d.time > 0).length >= 5 ? 'bg-green-50' : 'bg-yellow-50',
      actionable: insights.dailyTrend.filter(d => d.time > 0).length < 5
    },
    {
      headline: "Energy optimization",
      takeaway: `Your productivity score is ${insights.productivityScore}/100`,
      comparison: "Based on volume and consistency metrics",
      value: `${insights.productivityScore}/100`,
      icon: Zap,
      color: insights.productivityScore >= 70 ? 'text-green-500' : 
             insights.productivityScore >= 40 ? 'text-yellow-500' : 'text-red-500',
      bgColor: insights.productivityScore >= 70 ? 'bg-green-50' : 
               insights.productivityScore >= 40 ? 'bg-yellow-50' : 'bg-red-50',
      actionable: insights.productivityScore < 70
    }
  ];

  // Filter out insights with no data
  const validInsights = insightCards.filter(card => {
    if (card.headline.includes('trending upward') && insights.weeklyGrowth === 0) return false;
    if (card.headline.includes('Peak performance') && insights.mostProductiveHour === 0) return false;
    return true;
  });

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-medium mb-2">No insights yet</h3>
        <p className="text-muted-foreground mb-4">
          Start using your timers to generate productivity insights
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Insight Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {validInsights.map((insight, index) => (
          <InsightCard
            key={index}
            headline={insight.headline}
            takeaway={insight.takeaway}
            comparison={insight.comparison}
            value={insight.value}
            icon={insight.icon}
            color={insight.color}
            bgColor={insight.bgColor}
            actionable={insight.actionable}
          />
        ))}
      </div>

      {/* Recommendations */}
      <InsightRecommendations 
        insights={insights}
        timers={timers}
        sessions={sessions}
      />
    </div>
  );
};

export default QuickInsightsDashboard;
