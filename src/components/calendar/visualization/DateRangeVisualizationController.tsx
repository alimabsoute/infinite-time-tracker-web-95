
import React, { useState, useCallback } from 'react';
import { subDays } from 'date-fns';
import { Timer, TimerSessionWithTimer } from '../../../types';
import DateRangeSelector from '../DateRangeSelector';
import ResizableActivityVisualization from './ResizableActivityVisualization';

interface DateRangeVisualizationControllerProps {
  filteredTimers: Timer[];
  sessions: TimerSessionWithTimer[];
  formatTime: (ms: number) => string;
}

const DateRangeVisualizationController: React.FC<DateRangeVisualizationControllerProps> = ({
  filteredTimers,
  sessions,
  formatTime
}) => {
  // Initialize with last 7 days
  const [startDate, setStartDate] = useState<Date>(() => subDays(new Date(), 6));
  const [endDate, setEndDate] = useState<Date>(() => new Date());

  const handleDateRangeChange = useCallback((newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, []);

  // Filter sessions based on selected date range
  const filteredSessions = sessions.filter(session => {
    if (!session.start_time) return false;
    const sessionDate = new Date(session.start_time);
    return sessionDate >= startDate && sessionDate <= endDate;
  });

  console.log('🔍 DateRangeVisualizationController - Filtering sessions:', {
    originalCount: sessions.length,
    filteredCount: filteredSessions.length,
    dateRange: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
  });

  return (
    <div className="space-y-6">
      {/* Date Range Selector at the top */}
      <DateRangeSelector
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={handleDateRangeChange}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800"
      />

      {/* Main Visualization Component */}
      <ResizableActivityVisualization
        filteredTimers={filteredTimers}
        sessions={filteredSessions}
        formatTime={formatTime}
      />
    </div>
  );
};

export default DateRangeVisualizationController;
