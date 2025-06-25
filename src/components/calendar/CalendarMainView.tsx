
import React, { useMemo, useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import CalendarHeader from "./CalendarHeader";
import DayView from "./DayView";
import { Timer, TimerSessionWithTimer } from "../../types";
import { getTotalTimeForDate, getAllTimersForDate, getHeatMapColor, formatTime, getSessionsForDate } from "./CalendarUtils";
import { cn } from "@/lib/utils";
import CalendarControls from "./CalendarControls";
import YearView from "./YearView";
import CalendarStats from "./CalendarStats";
import ColorLegend from "./ColorLegend";
import { renderDay } from "./CustomDayRenderer";
import UpcomingDeadlines from "./UpcomingDeadlines";
import CalendarSidebar from "./CalendarSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

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

  console.log('CalendarMainView - timers:', timers.length);
  console.log('CalendarMainView - sessions:', sessions.length);

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
      timers: getSessionsForDate(date, sessions).length, // Represents sessions now, not timers
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

  // Create enhanced day renderer with timers and sessions data
  const enhancedDayRenderer = useMemo(() => {
    // The functions passed to renderDay now use sessions for activity and timers for deadlines
    return renderDay(
      (date: Date) => getTotalTimeForDate(date, sessions),
      (date: Date) => getAllTimersForDate(date, timers), // for deadlines
      (date: Date) => getSessionsForDate(date, sessions) // for activity
    );
  }, [sessions, timers]);
  
  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-4 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Upcoming Deadlines Section - spans full width */}
      <div className="col-span-full">
        <UpcomingDeadlines timers={timers} />
      </div>

      {/* Calendar view - takes up 3 columns on large screens */}
      <Card className="lg:col-span-3 glass-effect border border-border/30 shadow-lg hover:shadow-xl transition-all duration-300">
        <CalendarHeader 
          currentMonth={currentMonth} 
          onMonthChange={handleMonthChange} 
        />
        <CardContent className="p-4 pt-0">
          <CalendarControls
            currentMonth={currentMonth}
            calendarView={calendarView}
            toggleYearView={toggleYearView}
            goToToday={goToToday}
            setCurrentMonth={setCurrentMonth}
          />
          
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex justify-center mt-4"
          >
            {calendarView === 'month' ? (
              <TooltipProvider delayDuration={500} skipDelayDuration={200}>
                <div className="flex justify-center w-full">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    className={cn(
                      "rounded-md border border-border/40 p-3 pointer-events-auto",
                      "w-full max-w-[500px]"
                    )}
                    components={{
                      Day: enhancedDayRenderer
                    }}
                    showOutsideDays={true}
                    numberOfMonths={1}
                  />
                </div>
              </TooltipProvider>
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
      
      {/* Sidebar - takes up 1 column */}
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
        
        {/* Daily details card */}
        {selectedDate && (
          <Card className="glass-effect border border-border/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-6">
              <DayView
                selectedDate={selectedDate}
                timers={timers} // Pass all timers for deadline info
                sessions={sessions} // Pass all sessions for activity info
                formatTime={formatTime}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                categories={categories}
              />
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CalendarMainView;
