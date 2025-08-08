
import React from "react";
import { motion } from "framer-motion";
import CalendarTabs from "./CalendarTabs";
import CalendarMainView from "./CalendarMainView";
import WeekView from "./WeekView";
import ActivityVisualization from "./ActivityVisualization";
import { formatTime } from "./CalendarUtils";
import { Timer, TimerSessionWithTimer } from "../../types";

interface CalendarContentProps {
  currentMonth: Date;
  handleMonthChange: (direction: 'prev' | 'next') => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  setCurrentMonth: (date: Date) => void;
  timers: Timer[];
  sessions: TimerSessionWithTimer[];
  sessionsLoading: boolean;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: string[];
}

const CalendarContent: React.FC<CalendarContentProps> = ({
  currentMonth,
  handleMonthChange,
  selectedDate,
  setSelectedDate,
  setCurrentMonth,
  timers,
  sessions,
  sessionsLoading,
  categoryFilter,
  setCategoryFilter,
  categories,
}) => {
  console.log('CalendarContent - Rendering with data:', {
    timersCount: timers.length,
    sessionsCount: sessions.length,
    sessionsLoading,
    selectedDate: selectedDate ? selectedDate.toISOString() : 'none'
  });

  // Filter timers by category for analytics
  const filteredTimers = React.useMemo(() => {
    if (categoryFilter === 'all') return timers;
    return timers.filter(timer => timer.category === categoryFilter);
  }, [timers, categoryFilter]);

  const calendarContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <CalendarMainView
        currentMonth={currentMonth}
        handleMonthChange={handleMonthChange}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        setCurrentMonth={setCurrentMonth}
        timers={timers}
        sessions={sessions}
        filteredTimers={filteredTimers}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
      />
      
      {selectedDate && (
        <WeekView 
          selectedDate={selectedDate}
          sessions={sessions}
          setSelectedDate={setSelectedDate}
        />
      )}
    </motion.div>
  );

  const analyticsContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ActivityVisualization
        filteredTimers={filteredTimers}
        sessions={sessions}
        formatTime={formatTime}
      />
    </motion.div>
  );

  return (
    <CalendarTabs
      children={calendarContent}
      analyticsContent={analyticsContent}
    />
  );
};

export default CalendarContent;
