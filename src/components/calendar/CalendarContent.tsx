import React from "react";
import { motion } from "framer-motion";
import CalendarTabs from "./CalendarTabs";
import UrgentDeadlinesBanner from "./UrgentDeadlinesBanner";
import ProductivityCalendarGrid from "./ProductivityCalendarGrid";
import MonthlySummaryCard from "./MonthlySummaryCard";
import TimerAnalyticsList from "./TimerAnalyticsList";
import DailyDetailsPanel from "./DailyDetailsPanel";
import QuickStatsDashboard from "./QuickStatsDashboard";
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
      className="space-y-6"
    >
      {/* Urgent Deadlines Banner */}
      <UrgentDeadlinesBanner timers={timers} />
      
      {/* 3-Column Layout to Match Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Main Calendar Grid (6 columns - 50%) */}
        <div className="lg:col-span-6">
          <ProductivityCalendarGrid
            currentMonth={currentMonth}
            handleMonthChange={handleMonthChange}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            sessions={sessions}
            timers={timers}
          />
        </div>
        
        {/* Middle: Monthly Summary (3 columns - 25%) */}
        <div className="lg:col-span-3 space-y-4">
          <MonthlySummaryCard
            currentMonth={currentMonth}
            sessions={sessions}
            timers={timers}
          />
          
          {/* Daily Details for Selected Date */}
          <DailyDetailsPanel
            selectedDate={selectedDate}
            sessions={sessions}
            timers={timers}
          />
        </div>
        
        {/* Right: Timer Analytics (3 columns - 25%) */}
        <div className="lg:col-span-3 space-y-4">
          <TimerAnalyticsList
            timers={timers}
            sessions={sessions}
            currentMonth={currentMonth}
          />
        </div>
      </div>
      
      {/* Quick Stats Bottom Section */}
      <div className="border-t pt-6">
        <QuickStatsDashboard
          selectedDate={selectedDate}
          timers={timers}
        />
      </div>
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