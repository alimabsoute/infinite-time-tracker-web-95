
import React from 'react';
import { Timer, TimerSessionWithTimer } from '../../types';
import { useProductivityInsights } from '../../hooks/useProductivityInsights';
import InsightCard from './InsightCard';
import InsightRecommendations from './InsightRecommendations';
import { Clock, TrendingUp, Target, Zap, Calendar, BarChart3 } from 'lucide-react';
import { formatTime } from '../timer/TimerUtils';
import { format, subDays, startOfWeek, endOfWeek, addDays, addHours } from 'date-fns';

interface QuickInsightsDashboardProps {
  timers: Timer[];
  sessions: TimerSessionWithTimer[];
}

const QuickInsightsDashboard: React.FC<QuickInsightsDashboardProps> = ({ 
  timers, 
  sessions 
}) => {
  const insights = useProductivityInsights(timers, sessions);

  // Generate countdown dates for actionable insights
  const getNextOptimalWorkTime = () => {
    const now = new Date();
    const nextWorkDay = addDays(now, 1);
    nextWorkDay.setHours(insights.mostProductiveHour, 0, 0, 0);
    return nextWorkDay;
  };

  const getWeekEndTarget = () => {
    const now = new Date();
    const weekEnd = endOfWeek(now);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  };

  const getNextDeadline = () => {
    if (insights.upcomingDeadlines.length > 0) {
      return new Date(insights.upcomingDeadlines[0].deadline!);
    }
    return addDays(new Date(), 7); // Default to next week
  };

  // Generate insight data with countdown functionality
  const insightCards = [
    {
      headline: "Your productivity is trending upward",
      takeaway: `You've increased your focus time by ${Math.abs(insights.weeklyGrowth).toFixed(1)}% this week`,
      comparison: `vs last week (${formatTime(insights.totalTimeLastWeek)})`,
      value: `+${insights.weeklyGrowth.toFixed(1)}%`,
      icon: TrendingUp,
      color: insights.weeklyGrowth >= 0 ? 'text-green-500' : 'text-red-500',
      bgColor: insights.weeklyGrowth >= 0 ? 'bg-green-50' : 'bg-red-50',
      actionable: insights.weeklyGrowth < 10,
      countdown: insights.weeklyGrowth < 10 ? {
        targetDate: getWeekEndTarget(),
        label: "Week ends in"
      } : undefined,
      realTimeUpdate: true
    },
    {
      headline: "Peak performance window identified",
      takeaway: `You're most productive at ${insights.mostProductiveHour}:00`,
      comparison: `Schedule important work during this time`,
      value: `${insights.mostProductiveHour}:00`,
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      actionable: true,
      countdown: {
        targetDate: getNextOptimalWorkTime(),
        label: "Next peak time in"
      }
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
      actionable: insights.averageSessionTime < 20 * 60 * 1000,
      realTimeUpdate: true
    },
    {
      headline: "Consistency score",
      takeaway: `You've been active ${insights.dailyTrend.filter(d => d.time > 0).length} out of 7 days`,
      comparison: "Consistency is key to building momentum",
      value: `${insights.dailyTrend.filter(d => d.time > 0).length}/7 days`,
      icon: BarChart3,
      color: insights.dailyTrend.filter(d => d.time > 0).length >= 5 ? 'text-green-500' : 'text-yellow-500',
      bgColor: insights.dailyTrend.filter(d => d.time > 0).length >= 5 ? 'bg-green-50' : 'bg-yellow-50',
      actionable: insights.dailyTrend.filter(d => d.time > 0).length < 5,
      countdown: insights.dailyTrend.filter(d => d.time > 0).length < 5 ? {
        targetDate: getWeekEndTarget(),
        label: "Week goal deadline"
      } : undefined
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
      actionable: insights.productivityScore < 70,
      realTimeUpdate: true
    }
  ];

  // Add urgent deadline insight if there are upcoming deadlines
  if (insights.upcomingDeadlines.length > 0) {
    const urgentDeadline = insights.upcomingDeadlines[0];
    insightCards.unshift({
      headline: "Urgent deadline approaching",
      takeaway: `"${urgentDeadline.name}" is due soon`,
      comparison: `${insights.upcomingDeadlines.length} total deadlines this week`,
      value: format(new Date(urgentDeadline.deadline!), 'MMM dd'),
      icon: Target,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      actionable: true,
      countdown: {
        targetDate: getNextDeadline(),
        label: "Due in"
      }
    });
  }

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
      {/* Real-time status indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">
            Live insights • Updated {format(new Date(), 'HH:mm')}
          </span>
        </div>
      </div>

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
            countdown={insight.countdown}
            realTimeUpdate={insight.realTimeUpdate}
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
