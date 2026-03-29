
import React, { useMemo, useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { motion } from "framer-motion";
import { Timer, TimerSessionWithTimer } from "../../types";
import { getTotalTimeForDate, getSessionsForDate } from "./CalendarUtils";
import { formatTime } from "./CalendarUtils";
import CalendarUpcomingSection from "./CalendarUpcomingSection";
import CalendarMainSection from "./CalendarMainSection";
import CalendarSidebarSection from "./CalendarSidebarSection";

interface CalendarMainViewProps {
  currentMonth: Date;
  handleMonthChange: (direction: 'prev' | 'next') => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  setCurrentMonth: (date: Date) => void;
  timers: Timer[];
  sessions: TimerSessionWithTimer[];
  filteredTimers: Timer[];
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: string[];
}

const CalendarMainView: React.FC<CalendarMainViewProps> = ({
  currentMonth,
  handleMonthChange,
  selectedDate,
  setSelectedDate,
  setCurrentMonth,
  timers,
  sessions,
  categoryFilter,
  setCategoryFilter,
  categories
}) => {
  const [calendarView, setCalendarView] = useState<'month' | 'year'>('month');


  useEffect(() => {
    const today = new Date();
    if (!selectedDate) {
      setSelectedDate(today);
    }
    // Only set current month to today if it's significantly different
    if (Math.abs(currentMonth.getTime() - today.getTime()) > 40 * 24 * 60 * 60 * 1000) {
      setCurrentMonth(today);
    }
  }, []);

  // Generate days with data for the current month using SESSIONS
  const daysWithData = useMemo(() => {
    if (!currentMonth || !sessions) return [];
    
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    return eachDayOfInterval({ start, end }).map(date => ({
      date,
      totalTime: getTotalTimeForDate(date, sessions),
      timers: getSessionsForDate(date, sessions).length,
      inCurrentMonth: isSameMonth(date, currentMonth)
    }));
  }, [currentMonth, sessions]);

  // Get most active day
  const mostActiveDay = useMemo(() => {
    if (daysWithData.length === 0) return null;
    return daysWithData.reduce((max, day) => 
      day.totalTime > max.totalTime ? day : max, daysWithData[0]);
  }, [daysWithData]);

  // Toggle year view
  const toggleYearView = () => {
    setCalendarView(calendarView === 'month' ? 'year' : 'month');
  };

  // Jump to today
  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  };
  
  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-4 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <CalendarUpcomingSection timers={timers} />

      <CalendarMainSection
        currentMonth={currentMonth}
        handleMonthChange={handleMonthChange}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        setCurrentMonth={setCurrentMonth}
        timers={timers}
        sessions={sessions}
        calendarView={calendarView}
        toggleYearView={toggleYearView}
        goToToday={goToToday}
        daysWithData={daysWithData}
        mostActiveDay={mostActiveDay}
      />
      
      <CalendarSidebarSection
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        setCurrentMonth={setCurrentMonth}
        timers={timers}
        sessions={sessions}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        formatTime={formatTime}
      />
    </motion.div>
  );
};

export default CalendarMainView;
