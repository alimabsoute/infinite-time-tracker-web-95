
import React from 'react';
import { isPast, isToday } from 'date-fns';
import { Timer } from "../../types";
import DayViewHeader from './DayViewHeader';
import DeadlinesList from './DeadlinesList';
import DayViewSummary from './DayViewSummary';
import TimersList from './TimersList';
import DayViewFilters from './DayViewFilters';

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
  // Get total time tracked for the selected date
  const totalTrackedTime = filteredTimers.reduce((sum, t) => sum + t.elapsedTime, 0);

  // Get deadlines for the selected date
  const deadlineTimers = selectedDate ? filteredTimers.filter(timer => 
    timer.deadline && 
    new Date(timer.deadline).toDateString() === selectedDate.toDateString()
  ) : [];

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
        sessionCount={filteredTimers.length}
      />
      
      <TimersList
        filteredTimers={filteredTimers}
        formatTime={formatTime}
        totalTrackedTime={totalTrackedTime}
      />
    </>
  );
};

export default DayView;
