import React from 'react';
import { isPast, isToday, format } from 'date-fns';
import { Timer, TimerSessionWithTimer } from "../../types";
import DayViewHeader from './DayViewHeader';
import DeadlinesList from './DeadlinesList';
import DayViewSummary from './DayViewSummary';
import QuickStatsDashboard from './QuickStatsDashboard';
import DayViewFilters from './DayViewFilters';
import { getTimersWithDeadlinesForDate, getSessionsForDate } from './CalendarUtils';
import HorizontalTimerDisplay from './HorizontalTimerDisplay';

interface DayViewProps {
  selectedDate: Date | undefined;
  timers: Timer[]; // All timers for deadline info
  sessions: TimerSessionWithTimer[]; // All sessions for the month
  formatTime: (ms: number) => string;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: string[];
}

const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  timers,
  sessions,
  formatTime,
  categoryFilter,
  setCategoryFilter,
  categories
}) => {

  if (!selectedDate) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>Select a date to view details</p>
      </div>
    );
  }

  // Get sessions for the selected date
  const daySessions = React.useMemo(() => {
    if (!selectedDate) return [];
    return getSessionsForDate(selectedDate, sessions);
  }, [selectedDate, sessions]);
  
  // Get deadlines for the selected date
  const deadlineTimers = React.useMemo(() => {
    if (!selectedDate) return [];
    return getTimersWithDeadlinesForDate(selectedDate, timers);
  }, [selectedDate, timers]);


  // Filter sessions by category
  const filteredSessions = React.useMemo(() => {
    if (categoryFilter === 'all') return daySessions;
    return daySessions.filter(session => {
      const category = session.timers?.category || "Uncategorized";
      return category === categoryFilter;
    });
  }, [daySessions, categoryFilter]);

  // Get total time tracked for the selected date from filtered sessions
  const totalTrackedTime = filteredSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);

  // Check for overdue deadlines
  const overdueDeadlines = deadlineTimers.filter(timer => 
    timer.deadline && 
    isPast(new Date(timer.deadline)) && 
    !isToday(new Date(timer.deadline))
  );

  // Sort deadline timers by deadline time
  const sortedDeadlineTimers = deadlineTimers.sort((a, b) => {
    if (!a.deadline || !b.deadline) return 0;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return (
    <div className="space-y-6">
      <DayViewHeader 
        selectedDate={selectedDate} 
        hasDeadlines={deadlineTimers.length > 0}
        hasOverdueDeadlines={overdueDeadlines.length > 0}
      />
      
      <DeadlinesList deadlineTimers={sortedDeadlineTimers} />
      
      <DayViewFilters 
        categoryFilter={categoryFilter} 
        setCategoryFilter={setCategoryFilter}
        categories={categories}
      />
      
      <DayViewSummary
        selectedDate={selectedDate}
        totalTrackedTime={totalTrackedTime}
        formatTime={formatTime}
        sessionCount={filteredSessions.length}
      />

      <HorizontalTimerDisplay
        sessions={filteredSessions}
        formatTime={formatTime}
      />
      
      <QuickStatsDashboard
        selectedDate={selectedDate}
        timers={timers} // This component may still need timers for other stats
      />
    </div>
  );
};

export default DayView;
