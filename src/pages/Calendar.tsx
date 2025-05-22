
import { useState, useMemo, useEffect } from "react";
import { useTimers } from "../hooks/useTimers";
import { format, subMonths, addMonths, isSameMonth } from "date-fns";
import { motion } from "framer-motion";

// Import our components
import CalendarLayout from "../components/calendar/CalendarLayout";
import CalendarActionButtons from "../components/calendar/CalendarActionButtons";
import FilterPanel from "../components/calendar/FilterPanel";
import CalendarMainView from "../components/calendar/CalendarMainView";
import CalendarTabs from "../components/calendar/CalendarTabs";
import WeekView from "../components/calendar/WeekView";
import ActivityVisualization from "../components/calendar/ActivityVisualization";
import { formatTime, getTimersForDate } from "../components/calendar/CalendarUtils";

const CalendarPage = () => {
  const { timers } = useTimers();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
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

  // Synchronize selected date with month view
  useEffect(() => {
    if (selectedDate && !isSameMonth(selectedDate, currentMonth)) {
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate]);

  return (
    <CalendarLayout 
      title="Activity Calendar"
      actionButtons={
        <CalendarActionButtons 
          viewMode={viewMode}
          setViewMode={setViewMode}
          setShowFilters={setShowFilters}
          showFilters={showFilters}
        />
      }
    >
      <FilterPanel 
        showFilters={showFilters}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
      />
      
      <CalendarTabs
        analyticsContent={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ActivityVisualization
              categoryDistribution={categoryDistribution}
              filteredTimers={filteredTimers}
              formatTime={formatTime}
            />
          </motion.div>
        }
      >
        <CalendarMainView 
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
        />
        
        {/* Weekly view */}
        {selectedDate && (
          <WeekView 
            weekData={weekData} 
            formatTime={formatTime} 
            selectedDate={selectedDate} 
          />
        )}
      </CalendarTabs>
    </CalendarLayout>
  );
};

export default CalendarPage;
