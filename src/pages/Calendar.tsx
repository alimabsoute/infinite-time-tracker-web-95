
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

  // Log debug info for troubleshooting
  React.useEffect(() => {
    console.log('📊 Calendar Debug Info:', debugInfo);
  }, [debugInfo]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
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
