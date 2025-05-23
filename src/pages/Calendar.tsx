
import { useState, useMemo, useEffect } from "react";
import { useTimers } from "../hooks/useTimers";
import Header from "../components/Header";
import AuthHeader from "../components/AuthHeader";
import { format, subMonths, addMonths, subWeeks, addWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarIcon, Activity, Filter, ArrowLeftRight, ChevronsUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Import our components
import CalendarHeader from "../components/calendar/CalendarHeader";
import { renderDay } from "../components/calendar/CustomDayRenderer";
import DayView from "../components/calendar/DayView";
import WeekView from "../components/calendar/WeekView";
import ActivityVisualization from "../components/calendar/ActivityVisualization";
import { formatTime, getTimersForDate, getTotalTimeForDate, getHeatMapColor } from "../components/calendar/CalendarUtils";
import CalendarMainView from "../components/calendar/CalendarMainView";

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

  // Synchronize selected date with month view
  useEffect(() => {
    if (selectedDate && !isSameMonth(selectedDate, currentMonth)) {
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate, currentMonth]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <AuthHeader />
      
      <motion.div 
        className="container mx-auto px-4 pb-20 max-w-5xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h1 
            className="text-2xl font-bold" 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Activity Calendar
          </motion.h1>
          
          <motion.div 
            className="flex gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <Filter size={14} />
              Filters
            </Button>
            
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as "day" | "week" | "month")}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="View mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day View</SelectItem>
                <SelectItem value="week">Week View</SelectItem>
                <SelectItem value="month">Month View</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </div>
        
        {/* Advanced filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              className="mb-6 p-4 border border-border/30 rounded-lg bg-background/50 backdrop-blur-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-wrap gap-4 items-center">
                <div>
                  <h3 className="text-sm font-medium mb-1">Category</h3>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Date Range</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <ArrowLeftRight size={12} className="mr-1" />
                      This Month
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <ChevronsUpDown size={12} className="mr-1" />
                      Custom Range
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Tabs defaultValue="calendar" className="w-full mb-6">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="calendar">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Activity className="mr-2 h-4 w-4" />
              Time Analytics
            </TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            <TabsContent value="calendar" className="mt-0">
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
              
              {/* Weekly view with correct selectedDate prop */}
              {selectedDate && (
                <WeekView 
                  weekData={weekData} 
                  formatTime={formatTime} 
                  selectedDate={selectedDate} 
                />
              )}
            </TabsContent>
            
            <TabsContent value="analytics">
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
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default CalendarPage;
