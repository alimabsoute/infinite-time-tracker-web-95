
import React, { useMemo, useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import CalendarHeader from "./CalendarHeader";
import DayView from "./DayView";
import { Timer } from "../../types";
import { getTotalTimeForDate, getAllTimersForDate, getHeatMapColor, formatTime } from "./CalendarUtils";
import { cn } from "@/lib/utils";
import CalendarControls from "./CalendarControls";
import YearView from "./YearView";
import CalendarStats from "./CalendarStats";
import ColorLegend from "./ColorLegend";
import { renderDay } from "./CustomDayRenderer";
import UpcomingDeadlines from "./UpcomingDeadlines";

interface CalendarMainViewProps {
  currentMonth: Date;
  handleMonthChange: (direction: 'prev' | 'next') => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  setCurrentMonth: (date: Date) => void;
  timers: Timer[];
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
  filteredTimers,
  categoryFilter,
  setCategoryFilter,
  categories
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [calendarView, setCalendarView] = useState<'month' | 'year'>('month');

  console.log('CalendarMainView - timers:', timers.length);
  console.log('CalendarMainView - selectedDate:', selectedDate);
  console.log('CalendarMainView - timers with deadlines:', timers.filter(t => t.deadline).map(t => ({ name: t.name, deadline: t.deadline })));

  // Ensure calendar opens on current month initially
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

  // Generate days with data for the current month
  const daysWithData = useMemo(() => {
    if (!currentMonth) return [];
    
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    return eachDayOfInterval({ start, end }).map(date => ({
      date,
      totalTime: getTotalTimeForDate(date, timers),
      timers: getAllTimersForDate(date, timers).length,
      inCurrentMonth: isSameMonth(date, currentMonth)
    }));
  }, [currentMonth, timers]);

  // Get most active day
  const mostActiveDay = useMemo(() => {
    if (daysWithData.length === 0) return null;
    return daysWithData.reduce((max, day) => 
      day.totalTime > max.totalTime ? day : max, daysWithData[0]);
  }, [daysWithData]);

  // Toggle calendar size
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

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

  // Create enhanced day renderer with timers data - use ALL timers, not just filtered ones
  const enhancedDayRenderer = useMemo(() => {
    return renderDay(
      (date: Date) => getTotalTimeForDate(date, timers),
      (date: Date) => getHeatMapColor(date, timers),
      (date: Date) => getAllTimersForDate(date, timers)
    );
  }, [timers]);
  
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Upcoming Deadlines Section */}
      <UpcomingDeadlines timers={timers} />

      {/* Calendar Section */}
      <Card className="glass-effect border border-border/30 shadow-lg hover:shadow-xl transition-all duration-300">
        <CalendarHeader 
          currentMonth={currentMonth} 
          onMonthChange={handleMonthChange} 
        />
        <CardContent className="p-4 pt-0">
          <CalendarControls
            currentMonth={currentMonth}
            isExpanded={isExpanded}
            calendarView={calendarView}
            toggleExpand={toggleExpand}
            toggleYearView={toggleYearView}
            goToToday={goToToday}
            setCurrentMonth={setCurrentMonth}
          />
          
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex justify-center"
          >
            {calendarView === 'month' ? (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="rounded-md border border-border/40 p-3 pointer-events-auto w-full max-w-[600px]"
                components={{
                  Day: enhancedDayRenderer
                }}
                showOutsideDays={true}
                numberOfMonths={1}
              />
            ) : (
              <YearView
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                setCurrentMonth={setCurrentMonth}
                setCalendarView={setCalendarView}
              />
            )}
          </motion.div>
          
          {/* Calendar summary and stats */}
          <CalendarStats
            daysWithData={daysWithData}
            mostActiveDay={mostActiveDay}
            setSelectedDate={setSelectedDate}
          />
          
          {/* Color scale legend */}
          <ColorLegend />
        </CardContent>
      </Card>
      
      {/* Daily details */}
      <motion.div
        key={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : "no-date"}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="glass-effect border border-border/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <DayView
              selectedDate={selectedDate}
              filteredTimers={timers}
              formatTime={formatTime}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              categories={categories}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CalendarMainView;
