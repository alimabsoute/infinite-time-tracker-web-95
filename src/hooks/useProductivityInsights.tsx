
import { useMemo } from 'react';
import { Timer, TimerSessionWithTimer } from '../types';
import { startOfWeek, endOfWeek, subWeeks, format, isSameDay, parseISO } from 'date-fns';

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

export const useProductivityInsights = (
  timers: Timer[], 
  sessions: TimerSessionWithTimer[]
): ProductivityInsights => {
  return useMemo(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now);
    const thisWeekEnd = endOfWeek(now);
    const lastWeekStart = subWeeks(thisWeekStart, 1);
    const lastWeekEnd = subWeeks(thisWeekEnd, 1);

    // Filter sessions for this week and last week
    const thisWeekSessions = sessions.filter(session => {
      const sessionDate = parseISO(session.start_time);
      return sessionDate >= thisWeekStart && sessionDate <= thisWeekEnd;
    });

    const lastWeekSessions = sessions.filter(session => {
      const sessionDate = parseISO(session.start_time);
      return sessionDate >= lastWeekStart && sessionDate <= lastWeekEnd;
    });

    // Calculate totals from sessions
    const totalTimeThisWeek = thisWeekSessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0);
    const totalTimeLastWeek = lastWeekSessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0);
    const weeklyGrowth = totalTimeLastWeek > 0 ? ((totalTimeThisWeek - totalTimeLastWeek) / totalTimeLastWeek) * 100 : 0;

    // Calculate average session time from actual sessions
    const completedSessions = sessions.filter(session => session.duration_ms && session.duration_ms > 0);
    const averageSessionTime = completedSessions.length > 0 ? 
      completedSessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0) / completedSessions.length : 0;

    // Find most productive hour based on session start times
    const hourCounts = new Map<number, number>();
    sessions.forEach(session => {
      if (session.duration_ms && session.duration_ms > 0) {
        const hour = parseISO(session.start_time).getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + session.duration_ms);
      }
    });
    const mostProductiveHour = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 9;

    // Find most productive day based on session data
    const dayMap = new Map<string, number>();
    sessions.forEach(session => {
      if (session.duration_ms && session.duration_ms > 0) {
        const dayName = format(parseISO(session.start_time), 'EEEE');
        dayMap.set(dayName, (dayMap.get(dayName) || 0) + session.duration_ms);
      }
    });
    const mostProductiveDay = Array.from(dayMap.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Monday';

    // Category breakdown based on sessions
    const categoryMap = new Map<string, number>();
    sessions.forEach(session => {
      if (session.duration_ms && session.duration_ms > 0) {
        const category = session.timers?.category || 'Uncategorized';
        categoryMap.set(category, (categoryMap.get(category) || 0) + session.duration_ms);
      }
    });
    const totalTime = Array.from(categoryMap.values()).reduce((sum, time) => sum + time, 0);
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, time]) => ({
      category,
      time,
      percentage: totalTime > 0 ? (time / totalTime) * 100 : 0
    })).sort((a, b) => b.time - a.time);

    // Daily trend for last 7 days based on sessions
    const dailyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const daySessions = sessions.filter(session => 
        isSameDay(parseISO(session.start_time), date)
      );
      return {
        date,
        time: daySessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0)
      };
    }).reverse();

    // Productivity score based on session data
    const consistencyScore = dailyTrend.filter(day => day.time > 0).length * (100/7);
    const volumeScore = Math.min(100, (totalTimeThisWeek / (8 * 3600000)) * 100); // Target: 8 hours/week
    const productivityScore = Math.round((consistencyScore + volumeScore) / 2);

    // Completion rate based on meaningful sessions (>5 minutes)
    const meaningfulSessions = sessions.filter(session => (session.duration_ms || 0) > 300000);
    const completionRate = sessions.length > 0 ? (meaningfulSessions.length / sessions.length) * 100 : 0;

    // Upcoming deadlines from timers (this stays the same)
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
  }, [timers, sessions]);
};
