
import { useState, useMemo } from "react";
import { useTimers } from "../hooks/useTimers";
import Header from "../components/Header";
import AuthHeader from "../components/AuthHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addDays, subMonths, addMonths } from "date-fns";
import { Timer } from "../types";
import { Progress } from "@/components/ui/progress";
import { Calendar as CalendarIcon, Clock, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CalendarPage = () => {
  const { timers } = useTimers();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Get unique categories from timers
  const categories = Array.from(new Set(timers.map(timer => timer.category || "Uncategorized")));

  // Calculate timers for selected date
  const getTimersForDate = (date: Date | undefined) => {
    if (!date) return [];
    
    // Set time to midnight for comparison
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return timers.filter(timer => {
      const timerDate = new Date(timer.createdAt);
      return timerDate >= startOfDay && timerDate <= endOfDay;
    });
  };

  // Calculate total time tracked for a specific date
  const getTotalTimeForDate = (date: Date): number => {
    const dayTimers = getTimersForDate(date);
    return dayTimers.reduce((total, timer) => total + timer.elapsedTime, 0);
  };

  // Filter timers by category if needed
  const filteredTimers = useMemo(() => {
    if (!selectedDate) return [];
    
    return categoryFilter === "all"
      ? getTimersForDate(selectedDate)
      : getTimersForDate(selectedDate).filter(timer => 
          categoryFilter === "Uncategorized" 
            ? !timer.category 
            : timer.category === categoryFilter
        );
  }, [selectedDate, categoryFilter, timers]);

  // Format time for display
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Generate color intensity based on activity level
  const getHeatMapColor = (date: Date): string => {
    const totalTime = getTotalTimeForDate(date);
    
    if (totalTime === 0) return "bg-transparent";
    if (totalTime < 1800000) return "bg-blue-500/20"; // Less than 30 mins
    if (totalTime < 3600000) return "bg-blue-500/40"; // Less than 1 hour
    if (totalTime < 7200000) return "bg-blue-500/60"; // Less than 2 hours
    if (totalTime < 14400000) return "bg-blue-500/80"; // Less than 4 hours
    return "bg-blue-500"; // More than 4 hours
  };

  // Generate day cell component
  const renderDay = (day: Date, modifiers: any) => {
    const isToday = modifiers.today;
    const totalTime = getTotalTimeForDate(day);
    const hasActivity = totalTime > 0;
    const heatMapClass = getHeatMapColor(day);
    
    return (
      <div
        className={`relative w-full h-full flex items-center justify-center ${
          hasActivity ? heatMapClass : ""
        } rounded-full`}
      >
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full ${
            isToday ? "border-2 border-primary font-bold" : ""
          } ${modifiers.selected ? "bg-primary text-primary-foreground" : ""}`}
        >
          {format(day, "d")}
        </div>
        {hasActivity && !heatMapClass.includes("bg-blue-500") && (
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"></span>
        )}
      </div>
    );
  };

  // Timeline data for current week
  const weekData = useMemo(() => {
    if (!selectedDate) return [];
    
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const dayTimers = getTimersForDate(date);
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
    
    const dayTimers = getTimersForDate(selectedDate);
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
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
                  <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleMonthChange('prev')}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleMonthChange('next')}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    className="w-full rounded-md border p-3"
                    components={{
                      Day: ({ date, activeModifiers }) => renderDay(date, activeModifiers)
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
                  {/* Category filter */}
                  <div className="mb-4">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="bg-secondary/50 border-secondary">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent className="bg-secondary border-secondary text-foreground">
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.sort().map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Total time summary */}
                  {selectedDate && (
                    <div className="bg-secondary/30 p-3 rounded-md mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total tracked time:</span>
                        <span className="font-mono font-bold">
                          {formatTime(filteredTimers.reduce((sum, t) => sum + t.elapsedTime, 0))}
                        </span>
                      </div>
                      <Progress 
                        className="h-2 mt-2" 
                        value={Math.min(
                          (filteredTimers.reduce((sum, t) => sum + t.elapsedTime, 0) / (8 * 3600000)) * 100, 
                          100
                        )} 
                      />
                    </div>
                  )}
                  
                  {/* Session count */}
                  {selectedDate && filteredTimers.length > 0 && (
                    <div className="mb-4 text-center">
                      <Badge variant="outline" className="bg-primary/10">
                        {filteredTimers.length} {filteredTimers.length === 1 ? 'session' : 'sessions'} tracked
                      </Badge>
                    </div>
                  )}
                  
                  {/* Timers list for selected day */}
                  <div className="space-y-3 mt-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {filteredTimers.length > 0 ? (
                      <>
                        {filteredTimers.map((timer) => (
                          <div 
                            key={timer.id} 
                            className="flex justify-between items-center p-3 rounded-md bg-secondary/20 border border-border/50 hover:bg-secondary/30 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-10 rounded-full ${
                                timer.category === "Work" ? "bg-blue-500" :
                                timer.category === "Study" ? "bg-purple-500" :
                                timer.category === "Personal" ? "bg-green-500" :
                                timer.category === "Health" ? "bg-red-500" :
                                timer.category === "Leisure" ? "bg-amber-500" :
                                timer.category === "Project" ? "bg-indigo-500" :
                                timer.category === "Meeting" ? "bg-pink-500" :
                                "bg-gray-500"
                              }`}></div>
                              <div>
                                <p className="font-medium">{timer.name}</p>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock size={12} className="mr-1" />
                                  {format(new Date(timer.createdAt), "h:mm a")}
                                  {timer.category && (
                                    <Badge variant="outline" className="ml-2 h-5 text-[0.65rem]">
                                      {timer.category}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm font-mono font-medium">{formatTime(timer.elapsedTime)}</div>
                          </div>
                        ))}
                        
                        {/* Total time */}
                        <div className="flex justify-between items-center p-2 border-t border-border mt-4 pt-4">
                          <p className="font-medium">Total</p>
                          <p className="font-bold font-mono">
                            {formatTime(filteredTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0))}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No activity recorded for this day.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Weekly view when selected */}
            {selectedDate && viewMode !== "day" && (
              <Card className="glass-effect mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weekData}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-popover text-popover-foreground border border-border p-2 rounded-md shadow-md">
                                  <p className="font-medium">{format(data.date, 'MMM d')}</p>
                                  <p className="text-sm">
                                    {formatTime(data.totalHours * 3600000)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {data.timers} {data.timers === 1 ? 'timer' : 'timers'}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="totalHours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category distribution */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-lg">Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryDistribution.length > 0 ? (
                    <div className="space-y-3">
                      {categoryDistribution.map(item => (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium">{item.name}</span>
                            <span className="font-mono">
                              {formatTime(item.value * 3600000)}
                            </span>
                          </div>
                          <Progress 
                            value={
                              (item.value / categoryDistribution.reduce((sum, i) => sum + i.value, 0)) * 100
                            } 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No activity recorded for selected date.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Most productive times */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-lg">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] relative">
                    {filteredTimers.length > 0 ? (
                      <div className="grid grid-cols-12 h-full gap-1">
                        {Array.from({ length: 12 }).map((_, i) => {
                          const hour = i * 2; // 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22
                          const nextHour = hour + 2;
                          
                          // Calculate activity in this time range
                          const activityInRange = filteredTimers.filter(timer => {
                            const date = new Date(timer.createdAt);
                            const timerHour = date.getHours();
                            return timerHour >= hour && timerHour < nextHour;
                          });
                          
                          const totalTime = activityInRange.reduce((sum, timer) => sum + timer.elapsedTime, 0);
                          const maxTime = 7200000; // 2 hours in ms
                          const heightPercentage = Math.min(100, (totalTime / maxTime) * 100);
                          
                          return (
                            <div key={hour} className="flex flex-col h-full relative">
                              <div className="mt-auto flex flex-col items-center">
                                <div 
                                  className="w-full bg-primary/80 rounded-t-sm"
                                  style={{ height: `${heightPercentage}%` }}
                                ></div>
                                <span className="text-[10px] mt-1">{hour}</span>
                              </div>
                              {i % 2 === 0 && (
                                <div className="absolute -bottom-6 left-0 text-[10px] text-muted-foreground whitespace-nowrap">
                                  {hour}:00
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No activity data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CalendarPage;
