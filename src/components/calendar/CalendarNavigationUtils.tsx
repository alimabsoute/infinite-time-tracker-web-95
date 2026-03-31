
import { startOfMonth, endOfMonth, subMonths, eachWeekOfInterval } from 'date-fns';
import { TimerSessionWithTimer } from "../../types";
import { getSessionsForDateRange } from "./CalendarUtils";

export interface MonthWithData {
  date: Date;
  sessionCount: number;
  totalTime: number;
  hasSignificantData: boolean;
}

export interface WeekWithData {
  weekStart: Date;
  sessionCount: number;
  totalTime: number;
  hasSignificantData: boolean;
}

export const getMonthsWithData = (sessions: TimerSessionWithTimer[], monthsToCheck = 12): MonthWithData[] => {
  if (!sessions.length) return [];

  const months: MonthWithData[] = [];
  const today = new Date();
  
  // Check current month and previous months
  for (let i = 0; i < monthsToCheck; i++) {
    const monthDate = subMonths(today, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    
    const monthSessions = getSessionsForDateRange(monthStart, monthEnd, sessions);
    const totalTime = monthSessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0);
    const hasSignificantData = totalTime > 3600000; // More than 1 hour
    
    months.push({
      date: monthDate,
      sessionCount: monthSessions.length,
      totalTime,
      hasSignificantData
    });
  }
  
  return months.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const getWeeksWithDataInMonth = (month: Date, sessions: TimerSessionWithTimer[]): WeekWithData[] => {
  if (!sessions.length) return [];

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd });
  
  return weeks.map(weekStart => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekSessions = getSessionsForDateRange(weekStart, weekEnd, sessions);
    const totalTime = weekSessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0);
    const hasSignificantData = totalTime > 1800000; // More than 30 minutes
    
    return {
      weekStart,
      sessionCount: weekSessions.length,
      totalTime,
      hasSignificantData
    };
  });
};

export const findNearestMonthWithData = (
  currentMonth: Date, 
  sessions: TimerSessionWithTimer[], 
  direction: 'previous' | 'next'
): Date | null => {
  const monthsWithData = getMonthsWithData(sessions, 24);
  const currentTime = currentMonth.getTime();
  
  if (direction === 'previous') {
    const previousMonth = monthsWithData.find(month => 
      month.date.getTime() < currentTime && month.hasSignificantData
    );
    return previousMonth?.date || null;
  } else {
    const nextMonth = monthsWithData.find(month => 
      month.date.getTime() > currentTime && month.hasSignificantData
    );
    return nextMonth?.date || null;
  }
};
