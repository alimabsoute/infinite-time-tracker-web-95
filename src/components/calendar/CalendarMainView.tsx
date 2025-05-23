
import React, { useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import CalendarHeader from "./CalendarHeader";
import DayView from "./DayView";
import { Timer } from "../../types";
import { getTotalTimeForDate, getTimersForDate, getHeatMapColor, formatTime } from "./CalendarUtils";
import { cn } from "@/lib/utils";
import CalendarControls from "./CalendarControls";
import YearView from "./YearView";
import CalendarStats from "./CalendarStats";
import ColorLegend from "./ColorLegend";
import { useEnhancedDayRenderer } from "./EnhancedDayRenderer";

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
  const [isExpanded, setIsExpanded] = useState<boolean>(true); // Default to expanded view
  const [calendarView, setCalendarView] = useState<'month' | 'year'>('month');
  const [showDateDetail, setShowDateDetail] = useState<boolean>(false);

  // Generate days with data for the current month
  const daysWithData = useMemo(() => {
    if (!currentMonth) return [];
    
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    return eachDayOfInterval({ start, end }).map(date => ({
      date,
      totalTime: getTotalTimeForDate(date, timers),
      timers: getTimersForDate(date, timers).length,
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

  // Toggle date details overlay
  const toggleDateDetail = () => {
    setShowDateDetail(!showDateDetail);
  };

  // Get enhanced day renderer
  const enhancedDay = useEnhancedDayRenderer(
    (date: Date) => getTotalTimeForDate(date, timers),
    (date: Date) => getHeatMapColor(date, timers),
    selectedDate
  );
  
  return (
    <motion.div 
      className={`grid grid-cols-1 ${isExpanded ? 'md:grid-cols-1' : 'md:grid-cols-3'} gap-6`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Calendar view */}
      <Card className={cn(
        `${isExpanded ? 'md:col-span-1' : 'md:col-span-2'} glass-effect border border-border/30 shadow-lg hover:shadow-xl transition-all duration-300`,
        isExpanded && "col-span-1"
      )}>
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
            className={isExpanded ? "flex justify-center" : ""}
          >
            {calendarView === 'month' ? (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className={cn(
                  "rounded-md border border-border/40 p-3 pointer-events-auto",
                  isExpanded ? "w-full max-w-[800px]" : "w-full"
                )}
                components={{
                  Day: enhancedDay
                }}
                showOutsideDays={true}
                numberOfMonths={isExpanded ? 1 : 1}
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
          
          {/* Calendar navigation controls are now part of CalendarControls */}
          
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
      
      {/* Daily details - only show if not in expanded mode */}
      {!isExpanded && (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate ? selectedDate.toString() : "no-date"}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-effect border border-border/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <DayView
                  selectedDate={selectedDate}
                  filteredTimers={filteredTimers}
                  formatTime={formatTime}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  categories={categories}
                />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default CalendarMainView;
