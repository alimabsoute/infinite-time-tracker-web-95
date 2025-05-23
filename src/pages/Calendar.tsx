
import { useState, useMemo } from "react";
import { useTimers } from "../hooks/useTimers";
import { motion } from "framer-motion";
import { format, subMonths, addMonths, subWeeks, addWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import CalendarLayout from "../components/calendar/CalendarLayout";
import CalendarPageHeader from "../components/calendar/CalendarPageHeader";
import CalendarContent from "../components/calendar/CalendarContent";
import { getTimersForDate, getTotalTimeForDate } from "../components/calendar/CalendarUtils";

const CalendarPage = () => {
  const { timers } = useTimers();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Get unique categories from timers
  const categories = Array.from(new Set(timers.map(timer => timer.category || "Uncategorized")));

  // Filter timers by category if needed
  const filteredTimers = useMemo(() => {
    if (!selectedDate) return [];
    
    return categoryFilter === "all"
      ? getTimersForDate(selectedDate, timers)
      : getTimersForDate(selectedDate, timers).filter(timer => 
          categoryFilter === "Uncategorized" 
            ? !timer.category 
            : timer.category === categoryFilter
        );
  }, [selectedDate, categoryFilter, timers]);

  // Timeline data for current week
  const weekData = useMemo(() => {
    if (!selectedDate) return [];
    
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const dayTimers = getTimersForDate(date, timers);
      const totalTime = dayTimers.reduce((total, timer) => total + timer.elapsedTime, 0);
      
      return {
        date,
        day: format(date, "EEE"),
        totalHours: totalTime / 3600000, // Convert to hours
        timers: dayTimers.length
      };
    });
  }, [selectedDate, timers]);

  // Category distribution for selected date
  const categoryDistribution = useMemo(() => {
    if (!selectedDate) return [];
    
    const dayTimers = getTimersForDate(selectedDate, timers);
    const categories = new Map<string, number>();
    
    dayTimers.forEach(timer => {
      const category = timer.category || "Uncategorized";
      categories.set(category, (categories.get(category) || 0) + timer.elapsedTime);
    });
    
    return Array.from(categories.entries()).map(([name, value]) => ({
      name,
      value: value / 3600000 // Convert to hours
    }));
  }, [selectedDate, timers]);

  // Handle month navigation
  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1));
  };

  // Handle week navigation
  const handleWeekChange = (direction: 'prev' | 'next') => {
    if (selectedDate) {
      const newDate = direction === 'prev' 
        ? subWeeks(selectedDate, 1) 
        : addWeeks(selectedDate, 1);
      setSelectedDate(newDate);
    }
  };

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
      className="min-h-screen bg-background text-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <CalendarLayout title="Activity Calendar">
        <CalendarPageHeader
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
        />
        
        <CalendarContent
          currentMonth={currentMonth}
          handleMonthChange={handleMonthChange}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setCurrentMonth={setCurrentMonth}
          timers={timers}
          filteredTimers={filteredTimers}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
          weekData={weekData}
          categoryDistribution={categoryDistribution}
        />
      </CalendarLayout>
    </motion.div>
  );
};

export default CalendarPage;
