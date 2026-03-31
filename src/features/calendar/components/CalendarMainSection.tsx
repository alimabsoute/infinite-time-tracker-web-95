
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@shared/components/ui/card";
import { Calendar } from "@shared/components/ui/calendar";
import { TooltipProvider } from "@shared/components/ui/tooltip";
import CalendarHeader from "./CalendarHeader";
import DataAwareCalendarNavigation from "./DataAwareCalendarNavigation";
import CalendarStats from "./CalendarStats";
import ColorLegend from "./ColorLegend";
import YearView from "./YearView";
import { Timer, TimerSessionWithTimer } from "../../types";
import { cn } from "@shared/lib/utils";
import { renderDay } from "./CustomDayRenderer";
import { getTotalTimeForDate, getAllTimersForDate, getSessionsForDate } from "./CalendarUtils";

interface CalendarMainSectionProps {
  currentMonth: Date;
  handleMonthChange: (direction: 'prev' | 'next') => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  setCurrentMonth: (date: Date) => void;
  timers: Timer[];
  sessions: TimerSessionWithTimer[];
  calendarView: 'month' | 'year';
  toggleYearView: () => void;
  goToToday: () => void;
  daysWithData: any[];
  mostActiveDay: any;
}

const CalendarMainSection: React.FC<CalendarMainSectionProps> = ({
  currentMonth,
  handleMonthChange,
  selectedDate,
  setSelectedDate,
  setCurrentMonth,
  timers,
  sessions,
  calendarView,
  toggleYearView,
  goToToday,
  daysWithData,
  mostActiveDay
}) => {
  // Create enhanced day renderer with timers and sessions data
  const enhancedDayRenderer = useMemo(() => {
    return renderDay(
      (date: Date) => getTotalTimeForDate(date, sessions),
      (date: Date) => getAllTimersForDate(date, timers),
      (date: Date) => getSessionsForDate(date, sessions)
    );
  }, [sessions, timers]);

  return (
    <Card className="lg:col-span-3 glass-effect border border-border/30 shadow-lg hover:shadow-xl transition-all duration-300">
      <CalendarHeader 
        currentMonth={currentMonth} 
        onMonthChange={handleMonthChange} 
      />
      <CardContent className="p-4 pt-0">
        <DataAwareCalendarNavigation
          currentMonth={currentMonth}
          calendarView={calendarView}
          toggleYearView={toggleYearView}
          goToToday={goToToday}
          setCurrentMonth={setCurrentMonth}
          sessions={sessions}
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
              setCalendarView={() => {}} // This will be handled by parent
            />
          )}
        </motion.div>
        
        <CalendarStats
          daysWithData={daysWithData}
          mostActiveDay={mostActiveDay}
          setSelectedDate={setSelectedDate}
        />
        
        <ColorLegend />
      </CardContent>
    </Card>
  );
};

export default CalendarMainSection;
