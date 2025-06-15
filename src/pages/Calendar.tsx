
import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import CalendarContent from '../components/calendar/CalendarContent';
import { useTimers } from '../hooks/useTimers';
import { useTimerSessionsDebug } from '../hooks/useTimerSessionsDebug';

const Calendar = () => {
  const { timers } = useTimers();
  const { sessions, loading: sessionsLoading, debugInfo } = useTimerSessionsDebug();
  
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [categoryFilter, setCategoryFilter] = React.useState('all');

  // Enhanced debug logging
  React.useEffect(() => {
    console.log('📊 Calendar Component - Full Debug State:', {
      timersCount: timers.length,
      sessionsCount: sessions.length,
      sessionsLoading,
      debugInfo,
      currentMonth: currentMonth.toISOString(),
      selectedDate: selectedDate?.toISOString(),
      categoryFilter
    });

    // Log sample sessions for verification
    if (sessions.length > 0) {
      console.log('📊 Calendar - Sample Sessions Data:', sessions.slice(0, 3).map(s => ({
        id: s.id,
        start_time: s.start_time,
        duration_ms: s.duration_ms,
        timer_name: s.timers?.name
      })));
    }
  }, [timers, sessions, sessionsLoading, debugInfo, currentMonth, selectedDate, categoryFilter]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
    console.log('📅 Month changed to:', newMonth.toISOString());
  };

  // Get unique categories from timers
  const categories = React.useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(timers.map(timer => timer.category || 'Uncategorized'))
    );
    return uniqueCategories.sort();
  }, [timers]);

  return (
    <PageLayout 
      title="Calendar View"
      description="Track your productivity patterns and analyze timer sessions over time"
    >
      <CalendarContent
        currentMonth={currentMonth}
        handleMonthChange={handleMonthChange}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        setCurrentMonth={setCurrentMonth}
        timers={timers}
        sessions={sessions}
        sessionsLoading={sessionsLoading}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
      />
    </PageLayout>
  );
};

export default Calendar;
