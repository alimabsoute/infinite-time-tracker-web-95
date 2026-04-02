
import React, { useMemo } from 'react';
import { Timer } from '@/types';
import { formatTime } from './CalendarUtils';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar as CalendarIcon,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, subWeeks, isSameDay } from 'date-fns';
import QuickStatsItem from './QuickStatsItem';

interface QuickStatsDashboardProps {
  selectedDate: Date | undefined;
  timers: Timer[];
}

const QuickStatsDashboard: React.FC<QuickStatsDashboardProps> = ({
  selectedDate,
  timers
}) => {
  const stats = useMemo(() => {
    if (!selectedDate) return null;

    const now = new Date();
    const thisWeekStart = startOfWeek(now);
    const thisWeekEnd = endOfWeek(now);
    const lastWeekStart = subWeeks(thisWeekStart, 1);
    const lastWeekEnd = subWeeks(thisWeekEnd, 1);

    // Today's stats
    const todayTimers = timers.filter(timer => 
      isSameDay(new Date(timer.createdAt), selectedDate)
    );
    const todayTime = todayTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
    const todaySessions = todayTimers.length;

    // This week's stats
    const thisWeekTimers = timers.filter(timer => {
      const timerDate = new Date(timer.createdAt);
      return timerDate >= thisWeekStart && timerDate <= thisWeekEnd;
    });
    const thisWeekTime = thisWeekTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0);

    // Last week's stats for comparison
    const lastWeekTimers = timers.filter(timer => {
      const timerDate = new Date(timer.createdAt);
      return timerDate >= lastWeekStart && timerDate <= lastWeekEnd;
    });
    const lastWeekTime = lastWeekTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0);

    // Calculate weekly growth
    const weeklyGrowth = lastWeekTime > 0 ? 
      ((thisWeekTime - lastWeekTime) / lastWeekTime) * 100 : 0;

    // Average session time
    const allSessions = timers.filter(timer => timer.elapsedTime > 0);
    const avgSessionTime = allSessions.length > 0 ? 
      allSessions.reduce((sum, timer) => sum + timer.elapsedTime, 0) / allSessions.length : 0;

    // Upcoming deadlines (next 7 days)
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingDeadlines = timers.filter(timer => 
      timer.deadline && 
      new Date(timer.deadline) >= now && 
      new Date(timer.deadline) <= nextWeek
    ).length;

    // Productive sessions (> 25 minutes)
    const productiveSessions = todayTimers.filter(timer => 
      timer.elapsedTime > 25 * 60 * 1000
    ).length;

    // Completion rate for today (sessions > 5 minutes)
    const completedSessions = todayTimers.filter(timer => 
      timer.elapsedTime > 5 * 60 * 1000
    ).length;
    const completionRate = todaySessions > 0 ? 
      (completedSessions / todaySessions) * 100 : 0;

    return {
      todayTime,
      todaySessions,
      thisWeekTime,
      weeklyGrowth,
      avgSessionTime,
      upcomingDeadlines,
      productiveSessions,
      completionRate
    };
  }, [selectedDate, timers]);

  if (!selectedDate || !stats) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Select a date to view productivity insights</p>
      </div>
    );
  }

  const isToday = isSameDay(selectedDate, new Date());
  const dateLabel = isToday ? 'Today' : format(selectedDate, 'MMM d, yyyy');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Quick Stats - {dateLabel}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickStatsItem
          title="Time Tracked"
          value={formatTime(stats.todayTime)}
          subtitle={`${stats.todaySessions} session${stats.todaySessions !== 1 ? 's' : ''}`}
          icon={Clock}
          color="text-blue-600"
        />

        <QuickStatsItem
          title="Weekly Progress"
          value={formatTime(stats.thisWeekTime)}
          subtitle="This week total"
          icon={TrendingUp}
          color="text-green-600"
          trend={{
            value: stats.weeklyGrowth,
            isPositive: stats.weeklyGrowth >= 0
          }}
        />

        <QuickStatsItem
          title="Average Session"
          value={formatTime(stats.avgSessionTime)}
          subtitle="Across all sessions"
          icon={Target}
          color="text-purple-600"
        />

        <QuickStatsItem
          title="Focus Sessions"
          value={stats.productiveSessions.toString()}
          subtitle="25+ minutes today"
          icon={CheckCircle}
          color="text-emerald-600"
        />

        <QuickStatsItem
          title="Completion Rate"
          value={`${Math.round(stats.completionRate)}%`}
          subtitle="Sessions > 5 min"
          icon={CalendarIcon}
          color="text-orange-600"
        />

        <QuickStatsItem
          title="Upcoming Deadlines"
          value={stats.upcomingDeadlines.toString()}
          subtitle="Next 7 days"
          icon={AlertTriangle}
          color="text-red-600"
        />
      </div>
    </div>
  );
};

export default QuickStatsDashboard;
