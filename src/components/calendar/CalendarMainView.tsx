
import React, { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import CalendarHeader from "./CalendarHeader";
import { renderDay } from "./CustomDayRenderer";
import DayView from "./DayView";
import { Timer } from "../../types";
import { getTotalTimeForDate, getHeatMapColor, formatTime, getTimersForDate } from "./CalendarUtils";

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
  
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Calendar view */}
      <Card className="md:col-span-2 glass-effect border border-border/30 shadow-lg hover:shadow-xl transition-all duration-300">
        <CalendarHeader 
          currentMonth={currentMonth} 
          onMonthChange={handleMonthChange} 
        />
        <CardContent className="p-4 pt-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="w-full rounded-md border border-border/40 p-3 pointer-events-auto"
            components={{
              Day: renderDay(
                (date) => getTotalTimeForDate(date, timers),
                (date) => getHeatMapColor(date, timers)
              )
            }}
          />
          
          {/* Calendar summary and stats */}
          <div className="mt-4 p-3 border border-border/30 rounded-lg bg-secondary/10">
            <div className="grid grid-cols-3 gap-2 text-center">
              {daysWithData.filter(d => d.totalTime > 0).length > 0 ? (
                <>
                  <div>
                    <div className="text-xs text-muted-foreground">Active Days</div>
                    <div className="text-xl font-medium">
                      {daysWithData.filter(d => d.totalTime > 0).length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Avg Time/Day</div>
                    <div className="text-xl font-medium">
                      {formatTime(
                        daysWithData.reduce((sum, day) => sum + day.totalTime, 0) / 
                        Math.max(1, daysWithData.filter(d => d.totalTime > 0).length)
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Total Hours</div>
                    <div className="text-xl font-medium">
                      {Math.round(daysWithData.reduce((sum, day) => sum + day.totalTime, 0) / 36000) / 100}h
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-3 py-2 text-center text-muted-foreground text-sm">
                  No activity recorded this month
                </div>
              )}
            </div>
          </div>
          
          {/* Color scale legend */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Activity Level:</span>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500/20 rounded-sm"></div>
              <span className="ml-1">Low</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500/40 rounded-sm"></div>
              <span className="ml-1">Medium</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500/80 rounded-sm"></div>
              <span className="ml-1">High</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Daily details */}
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
  );
};

export default CalendarMainView;
