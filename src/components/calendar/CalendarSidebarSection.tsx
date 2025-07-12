
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import CalendarSidebar from "./CalendarSidebar";
import DayView from "./DayView";
import { Timer, TimerSessionWithTimer } from "../../types";

interface CalendarSidebarSectionProps {
  currentMonth: Date;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  setCurrentMonth: (date: Date) => void;
  timers: Timer[];
  sessions: TimerSessionWithTimer[];
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: string[];
  formatTime: (ms: number) => string;
}

const CalendarSidebarSection: React.FC<CalendarSidebarSectionProps> = ({
  currentMonth,
  selectedDate,
  setSelectedDate,
  setCurrentMonth,
  timers,
  sessions,
  categoryFilter,
  setCategoryFilter,
  categories,
  formatTime
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <CalendarSidebar
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        timers={timers}
        sessions={sessions}
        onDateSelect={(date) => {
          setSelectedDate(date);
          setCurrentMonth(date);
        }}
      />
      
      {selectedDate && (
        <Card className="glass-effect border border-border/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <DayView
              selectedDate={selectedDate}
              timers={timers}
              sessions={sessions}
              formatTime={formatTime}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              categories={categories}
            />
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default CalendarSidebarSection;
