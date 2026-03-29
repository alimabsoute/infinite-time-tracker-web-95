import React from "react";
import { motion } from "framer-motion";
import ProductivityCalendarGrid from "./ProductivityCalendarGrid";
import MonthlySummaryCard from "./MonthlySummaryCard";
import TimerAnalyticsList from "./TimerAnalyticsList";
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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      {/* 3-Column Layout with only the main components */}
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
        <div className="lg:col-span-3">
          <MonthlySummaryCard
            currentMonth={currentMonth}
            sessions={sessions}
            timers={timers}
          />
        </div>
        
        {/* Right: Timer Analytics (3 columns - 25%) */}
        <div className="lg:col-span-3">
          <TimerAnalyticsList
            timers={timers}
            sessions={sessions}
            currentMonth={currentMonth}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarContent;