
import React from 'react';
import { isPast, isToday } from 'date-fns';
import { Timer } from "../../types";
import DayViewHeader from './DayViewHeader';
import DeadlinesList from './DeadlinesList';
import DayViewSummary from './DayViewSummary';
import TimersList from './TimersList';
import DayViewFilters from './DayViewFilters';
import { getAllTimersForDate, getTimersForDate } from './CalendarUtils';

interface DayViewProps {
  selectedDate: Date | undefined;
  filteredTimers: Timer[];
  formatTime: (ms: number) => string;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: string[];
}

const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  filteredTimers,
  formatTime,
  categoryFilter,
  setCategoryFilter,
  categories
}) => {
  console.log('DayView - selectedDate:', selectedDate);
  console.log('DayView - filteredTimers:', filteredTimers);

  if (!selectedDate) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>Select a date to view details</p>
      </div>
    );
  }

  // Get all timers relevant to the selected date (created or with deadlines) 
  // Use the full timer list instead of filteredTimers to ensure we get all deadline data
  const allDayTimers = getAllTimersForDate(selectedDate, filteredTimers);
  
  // Get only timers created on the selected date for time tracking calculation
  const createdOnDateTimers = getTimersForDate(selectedDate, filteredTimers);
  
  // Get total time tracked for the selected date (only from timers created on that date)
  const totalTrackedTime = createdOnDateTimers.reduce((sum, t) => sum + t.elapsedTime, 0);

  // Get deadlines for the selected date
  const deadlineTimers = allDayTimers.filter(timer => 
    timer.deadline && 
    new Date(timer.deadline).toDateString() === selectedDate.toDateString()
  );

  console.log('DayView - deadlineTimers for date:', deadlineTimers);

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
    <>
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
      
      <TimersList
        filteredTimers={createdOnDateTimers}
        formatTime={formatTime}
        totalTrackedTime={totalTrackedTime}
      />
    </>
  );
};

export default DayView;
