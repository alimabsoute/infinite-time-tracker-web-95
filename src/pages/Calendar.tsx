
import { useState, useMemo } from "react";
import { useTimers } from "../hooks/useTimers";
import Header from "../components/Header";
import AuthHeader from "../components/AuthHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subMonths, addMonths } from "date-fns";
import { CalendarIcon, Activity } from "lucide-react";

// Import our new components
import CalendarHeader from "../components/calendar/CalendarHeader";
import { renderDay } from "../components/calendar/CustomDayRenderer";
import DayView from "../components/calendar/DayView";
import WeekView from "../components/calendar/WeekView";
import ActivityVisualization from "../components/calendar/ActivityVisualization";
import { formatTime, getTimersForDate, getTotalTimeForDate, getHeatMapColor } from "../components/calendar/CalendarUtils";

const CalendarPage = () => {
  const { timers } = useTimers();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <AuthHeader />
      
      <div className="container mx-auto px-4 pb-20 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Activity Calendar</h1>
          
          <div className="flex gap-2">
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
          </div>
        </div>
        
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
          
          <TabsContent value="calendar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Calendar view */}
              <Card className="md:col-span-2 glass-effect">
                <CalendarHeader 
                  currentMonth={currentMonth} 
                  onMonthChange={handleMonthChange} 
                />
                <CardContent className="p-2 pt-0">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    className="w-full rounded-md border p-3 pointer-events-auto"
                    components={{
                      Day: renderDay(
                        (date) => getTotalTimeForDate(date, timers),
                        (date) => getHeatMapColor(date, timers)
                      )
                    }}
                  />
                  
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
              <Card className="glass-effect">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
            </div>
            
            {/* Weekly view when selected */}
            {selectedDate && viewMode !== "day" && (
              <WeekView weekData={weekData} formatTime={formatTime} />
            )}
          </TabsContent>
          
          <TabsContent value="analytics">
            <ActivityVisualization
              categoryDistribution={categoryDistribution}
              filteredTimers={filteredTimers}
              formatTime={formatTime}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CalendarPage;
