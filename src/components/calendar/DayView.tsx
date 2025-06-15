
import React from 'react';
import { isPast, isToday } from 'date-fns';
import { Timer } from "../../types";
import DayViewHeader from './DayViewHeader';
import DeadlinesList from './DeadlinesList';
import DayViewSummary from './DayViewSummary';
import HorizontalTimerDisplay from './HorizontalTimerDisplay';
import DayViewFilters from './DayViewFilters';
import { getTimersForDate, getTimersWithDeadlinesForDate } from './CalendarUtils';

interface DayViewProps {
  selectedDate: Date | undefined;
  filteredTimers: Timer[]; // This should actually be all timers, not filtered
  formatTime: (ms: number) => string;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: string[];
}

const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  filteredTimers, // This is actually the full timers array now
  formatTime,
  categoryFilter,
  setCategoryFilter,
  categories
}) => {
  console.log('DayView - selectedDate:', selectedDate);
  console.log('DayView - filteredTimers (should be all timers):', filteredTimers.length);

  if (!selectedDate) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>Select a date to view details</p>
      </div>
    );
  }

  // Get only timers created on the selected date for time tracking calculation
  const createdOnDateTimers = getTimersForDate(selectedDate, filteredTimers);
  
  // Get deadlines for the selected date using the utility function
  const deadlineTimers = getTimersWithDeadlinesForDate(selectedDate, filteredTimers);

  console.log('DayView - deadlineTimers for date:', deadlineTimers);
  console.log('DayView - createdOnDateTimers for date:', createdOnDateTimers);

  // Get total time tracked for the selected date (only from timers created on that date)
  const totalTrackedTime = createdOnDateTimers.reduce((sum, t) => sum + t.elapsedTime, 0);

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
        sessionCount={createdOnDateTimers.length}
      />
      
      <HorizontalTimerDisplay
        timers={createdOnDateTimers}
        formatTime={formatTime}
      />
    </div>
  );
};

export default DayView;
