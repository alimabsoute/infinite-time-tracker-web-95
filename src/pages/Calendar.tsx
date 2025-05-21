
import { useState } from "react";
import { useTimers } from "../hooks/useTimers";
import Header from "../components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Timer } from "../types";
import { Clock } from "lucide-react";

const Calendar = () => {
  const { timers } = useTimers();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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
  const filteredTimers = categoryFilter === "all"
    ? getTimersForDate(selectedDate)
    : getTimersForDate(selectedDate).filter(timer => 
        categoryFilter === "Uncategorized" 
          ? !timer.category 
          : timer.category === categoryFilter
      );

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

  // Generate date className for the calendar to show dots for days with activity
  const getDayClassNames = (day: Date | undefined): string => {
    if (!day) return "";
    
    const hasActivity = getTotalTimeForDate(day) > 0;
    
    return hasActivity 
      ? "bg-primary/20 rounded-full text-primary-foreground font-medium" 
      : "";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <div className="container mx-auto px-4 pb-20 max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Activity Calendar</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calendar view */}
          <Card className="md:col-span-2 glass-effect p-4">
            <CardContent className="p-2">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
                modifiersClassNames={{
                  selected: "bg-primary text-primary-foreground",
                }}
                modifiers={{
                  booked: (date) => getTotalTimeForDate(date) > 0,
                }}
                // Fix the styles property by using modifiersStyles instead
                modifiersStyles={{
                  today: { fontWeight: 'bold' },
                  booked: { 
                    position: 'relative',
                    fontWeight: 500,
                    // Use an element with absolute positioning for the dot indicator instead
                  }
                }}
              />
            </CardContent>
          </Card>
          
          {/* Daily details */}
          <Card className="glass-effect">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                </h2>
              </div>
              
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
              
              {/* Timers list for selected day */}
              <div className="space-y-3 mt-4">
                {filteredTimers.length > 0 ? (
                  <>
                    {filteredTimers.map((timer) => (
                      <div key={timer.id} className="flex justify-between items-center p-2 rounded-md bg-secondary/40">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-primary" />
                          <div>
                            <p className="font-medium">{timer.name}</p>
                            {timer.category && (
                              <p className="text-xs text-muted-foreground">{timer.category}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-sm font-mono">{formatTime(timer.elapsedTime)}</div>
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
      </div>
    </div>
  );
};

export default Calendar;
