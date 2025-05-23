
import React, { useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import CalendarHeader from "./CalendarHeader";
import { renderDay } from "./CustomDayRenderer";
import DayView from "./DayView";
import { Timer } from "../../types";
import { getTotalTimeForDate, getHeatMapColor, formatTime, getTimersForDate } from "./CalendarUtils";
import { ArrowLeft, ArrowRight, CalendarDays, ZoomIn, ZoomOut, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
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

  // Enhanced day renderer with animations
  const enhancedRenderDay = (getTime: any, getColor: any) => {
    const baseRenderer = renderDay(getTime, getColor);
    
    return (props: any) => {
      const { date } = props;
      const isHovered = hoveredDate && isSameDay(date, hoveredDate);
      const isSelected = selectedDate && isSameDay(date, selectedDate);
      
      // Render the base day with the existing functionality
      const baseDay = baseRenderer(props);
      
      // Add enhanced hover animations
      return (
        <motion.div 
          className={cn(
            "day-container relative",
            isSelected && "selected-day",
            isHovered && "hovered-day"
          )}
          whileHover={{ scale: 1.1 }}
          onHoverStart={() => setHoveredDate(date)}
          onHoverEnd={() => setHoveredDate(null)}
        >
          {baseDay}
        </motion.div>
      );
    };
  };
  
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
          <div className="flex justify-between items-center mb-2">
            <div className="flex space-x-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleYearView}
                className="text-xs flex items-center gap-1 h-8"
              >
                <CalendarIcon size={14} />
                {calendarView === 'month' ? 'Year View' : 'Month View'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToToday}
                className="text-xs h-8"
              >
                Today
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleExpand}
              className="text-xs flex items-center gap-1 h-8"
            >
              {isExpanded ? <ZoomOut size={14} /> : <ZoomIn size={14} />}
              {isExpanded ? "Compact View" : "Expand Calendar"}
            </Button>
          </div>
          
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
                  Day: enhancedRenderDay(
                    (date: Date) => getTotalTimeForDate(date, timers),
                    (date: Date) => getHeatMapColor(date, timers)
                  )
                }}
                showOutsideDays={true}
                numberOfMonths={isExpanded ? 1 : 1}
              />
            ) : (
              <div className="w-full max-w-[800px] border border-border/40 rounded-md p-4">
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthDate = new Date(currentMonth.getFullYear(), i, 1);
                    return (
                      <Button 
                        key={i}
                        variant={isSameMonth(monthDate, selectedDate || new Date()) ? "default" : "outline"}
                        size="sm"
                        className="h-auto py-4 flex flex-col gap-1"
                        onClick={() => {
                          setCurrentMonth(monthDate);
                          setCalendarView('month');
                        }}
                      >
                        <span>{format(monthDate, 'MMM')}</span>
                        <span className="text-xs opacity-70">{format(monthDate, 'yyyy')}</span>
                      </Button>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1))}
                  >
                    <ArrowLeft size={14} className="mr-1" />
                    {currentMonth.getFullYear() - 1}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date())}
                  >
                    Current Year
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1))}
                  >
                    {currentMonth.getFullYear() + 1}
                    <ArrowRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Calendar navigation */}
          <div className="flex justify-center mt-4 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="flex items-center"
            >
              <ArrowLeft size={14} className="mr-1" />
              {format(subMonths(currentMonth, 1), 'MMM')}
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
              className="flex items-center"
            >
              Today
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="flex items-center"
            >
              {format(addMonths(currentMonth, 1), 'MMM')}
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
          
          {/* Calendar summary and stats */}
          <motion.div 
            className="mt-4 p-3 border border-border/30 rounded-lg bg-secondary/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="grid grid-cols-3 gap-2 text-center">
              {daysWithData.filter(d => d.totalTime > 0).length > 0 ? (
                <>
                  <motion.div whileHover={{ y: -2 }} className="p-2">
                    <div className="text-xs text-muted-foreground">Active Days</div>
                    <div className="text-xl font-medium">
                      {daysWithData.filter(d => d.totalTime > 0).length}
                    </div>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} className="p-2">
                    <div className="text-xs text-muted-foreground">Avg Time/Day</div>
                    <div className="text-xl font-medium">
                      {formatTime(
                        daysWithData.reduce((sum, day) => sum + day.totalTime, 0) / 
                        Math.max(1, daysWithData.filter(d => d.totalTime > 0).length)
                      )}
                    </div>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} className="p-2">
                    <div className="text-xs text-muted-foreground">Total Hours</div>
                    <div className="text-xl font-medium">
                      {Math.round(daysWithData.reduce((sum, day) => sum + day.totalTime, 0) / 36000) / 100}h
                    </div>
                  </motion.div>
                  
                  {/* Most active day highlights */}
                  {mostActiveDay && mostActiveDay.totalTime > 0 && (
                    <div className="col-span-3 mt-2 pt-2 border-t border-border/30">
                      <div className="text-xs text-muted-foreground mb-1">Most Active Day</div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-sm font-medium"
                        onClick={() => setSelectedDate(mostActiveDay.date)}
                      >
                        {format(mostActiveDay.date, 'MMM d')} - {formatTime(mostActiveDay.totalTime)}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="col-span-3 py-2 text-center text-muted-foreground text-sm">
                  No activity recorded this month
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Color scale legend with interactive elements */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Activity Level:</span>
            <motion.div 
              className="flex items-center cursor-pointer"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-3 h-3 bg-blue-500/20 rounded-sm"></div>
              <span className="ml-1">Low</span>
            </motion.div>
            <motion.div 
              className="flex items-center cursor-pointer"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-3 h-3 bg-blue-500/40 rounded-sm"></div>
              <span className="ml-1">Medium</span>
            </motion.div>
            <motion.div 
              className="flex items-center cursor-pointer"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-3 h-3 bg-blue-500/80 rounded-sm"></div>
              <span className="ml-1">High</span>
            </motion.div>
          </div>
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
