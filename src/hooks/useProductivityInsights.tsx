
import { useMemo } from 'react';
import { Timer } from '../types';
import { startOfWeek, endOfWeek, subWeeks, format, differenceInDays, isSameDay, startOfDay, endOfDay } from 'date-fns';

export interface ProductivityInsights {
  totalTimeThisWeek: number;
  totalTimeLastWeek: number;
  weeklyGrowth: number;
  averageSessionTime: number;
  mostProductiveHour: number;
  mostProductiveDay: string;
  categoryBreakdown: { category: string; time: number; percentage: number }[];
  dailyTrend: { date: Date; time: number }[];
  productivityScore: number;
  completionRate: number;
  upcomingDeadlines: Timer[];
}

export const useProductivityInsights = (timers: Timer[]): ProductivityInsights => {
  return useMemo(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now);
    const thisWeekEnd = endOfWeek(now);
    const lastWeekStart = subWeeks(thisWeekStart, 1);
    const lastWeekEnd = subWeeks(thisWeekEnd, 1);

    // Filter timers for this week and last week
    const thisWeekTimers = timers.filter(timer => {
      const timerDate = new Date(timer.createdAt);
      return timerDate >= thisWeekStart && timerDate <= thisWeekEnd;
    });

    const lastWeekTimers = timers.filter(timer => {
      const timerDate = new Date(timer.createdAt);
      return timerDate >= lastWeekStart && timerDate <= lastWeekEnd;
    });

    // Calculate totals
    const totalTimeThisWeek = thisWeekTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
    const totalTimeLastWeek = lastWeekTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
    const weeklyGrowth = totalTimeLastWeek > 0 ? ((totalTimeThisWeek - totalTimeLastWeek) / totalTimeLastWeek) * 100 : 0;

    // Calculate average session time
    const allSessions = timers.filter(timer => timer.elapsedTime > 0);
    const averageSessionTime = allSessions.length > 0 ? 
      allSessions.reduce((sum, timer) => sum + timer.elapsedTime, 0) / allSessions.length : 0;

    // Find most productive hour
    const hourCounts = new Map<number, number>();
    timers.forEach(timer => {
      const hour = new Date(timer.createdAt).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + timer.elapsedTime);
    });
    const mostProductiveHour = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 9;

    // Find most productive day
    const dayMap = new Map<string, number>();
    timers.forEach(timer => {
      const dayName = format(new Date(timer.createdAt), 'EEEE');
      dayMap.set(dayName, (dayMap.get(dayName) || 0) + timer.elapsedTime);
    });
    const mostProductiveDay = Array.from(dayMap.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Monday';

    // Category breakdown
    const categoryMap = new Map<string, number>();
    timers.forEach(timer => {
      const category = timer.category || 'Uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + timer.elapsedTime);
    });
    const totalTime = Array.from(categoryMap.values()).reduce((sum, time) => sum + time, 0);
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, time]) => ({
      category,
      time,
      percentage: totalTime > 0 ? (time / totalTime) * 100 : 0
    })).sort((a, b) => b.time - a.time);

    // Daily trend for last 7 days
    const dailyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayTimers = timers.filter(timer => 
        isSameDay(new Date(timer.createdAt), date)
      );
      return {
        date,
        time: dayTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0)
      };
    }).reverse();

    // Productivity score (0-100 based on various factors)
    const consistencyScore = dailyTrend.filter(day => day.time > 0).length * (100/7);
    const volumeScore = Math.min(100, (totalTimeThisWeek / (8 * 3600000)) * 100); // Target: 8 hours/week
    const productivityScore = Math.round((consistencyScore + volumeScore) / 2);

    // Completion rate (timers with some time vs total timers)
    const completedTimers = timers.filter(timer => timer.elapsedTime > 300000); // > 5 minutes
    const completionRate = timers.length > 0 ? (completedTimers.length / timers.length) * 100 : 0;

    // Upcoming deadlines (next 7 days)
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingDeadlines = timers.filter(timer => 
      timer.deadline && 
      new Date(timer.deadline) >= now && 
      new Date(timer.deadline) <= nextWeek
    ).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

    return {
      totalTimeThisWeek,
      totalTimeLastWeek,
      weeklyGrowth,
      averageSessionTime,
      mostProductiveHour,
      mostProductiveDay,
      categoryBreakdown,
      dailyTrend,
      productivityScore,
      completionRate,
      upcomingDeadlines
    };
  }, [timers]);
};
