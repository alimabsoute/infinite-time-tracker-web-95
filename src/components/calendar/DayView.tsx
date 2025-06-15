
import React from 'react';
import { isPast, isToday, format } from 'date-fns';
import { Timer } from "../../types";
import DayViewHeader from './DayViewHeader';
import DeadlinesList from './DeadlinesList';
import DayViewSummary from './DayViewSummary';
import QuickStatsDashboard from './QuickStatsDashboard';
import DayViewFilters from './DayViewFilters';
import { getTimersForDate, getTimersWithDeadlinesForDate, getAllTimersForDate } from './CalendarUtils';

interface DayViewProps {
  selectedDate: Date | undefined;
  filteredTimers: Timer[]; // This should be all timers
  formatTime: (ms: number) => string;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: string[];
}

const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  filteredTimers, // This is the full timers array
  formatTime,
  categoryFilter,
  setCategoryFilter,
  categories
}) => {
  console.log('=== DayView Debug ===');
  console.log('DayView - selectedDate:', selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'none');
  console.log('DayView - total available timers:', filteredTimers.length);

  if (!selectedDate) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>Select a date to view details</p>
      </div>
    );
  }

  // Get ALL relevant timers for the selected date using the fixed utility functions
  const allRelevantTimers = React.useMemo(() => {
    const result = getAllTimersForDate(selectedDate, filteredTimers);
    console.log('DayView - allRelevantTimers calculated:', result.length);
    return result;
  }, [selectedDate, filteredTimers]);
  
  // Get only timers created on the selected date for time tracking calculation
  const createdOnDateTimers = React.useMemo(() => {
    const result = getTimersForDate(selectedDate, filteredTimers);
    console.log('DayView - createdOnDateTimers calculated:', result.length);
    return result;
  }, [selectedDate, filteredTimers]);
  
  // Get deadlines for the selected date using the utility function
  const deadlineTimers = React.useMemo(() => {
    const result = getTimersWithDeadlinesForDate(selectedDate, filteredTimers);
    console.log('DayView - deadlineTimers calculated:', result.length);
    return result;
  }, [selectedDate, filteredTimers]);

  console.log('DayView - Final data for', format(selectedDate, 'yyyy-MM-dd'), ':');
  console.log('  - deadlineTimers:', deadlineTimers.length);
  console.log('  - createdOnDateTimers:', createdOnDateTimers.length);
  console.log('  - allRelevantTimers:', allRelevantTimers.length);

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
      
      <QuickStatsDashboard
        selectedDate={selectedDate}
        timers={filteredTimers}
      />
    </div>
  );
};

export default DayView;
