
import { useState, useMemo, useEffect } from "react";
import { useTimers } from "../hooks/useTimers";
import { motion } from "framer-motion";
import { subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";
import CalendarLayout from "../components/calendar/CalendarLayout";
import CalendarPageHeader from "../components/calendar/CalendarPageHeader";
import CalendarContent from "../components/calendar/CalendarContent";
import MockDataButton from "../components/MockDataButton";
import { useAuth } from "../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TimerSessionWithTimer } from "../types";

const CalendarPage = () => {
  const { timers } = useTimers();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Initialize with current date and month
  useEffect(() => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  }, []);

  // Fetch timer sessions for the current month
  const { data: sessions, isLoading: sessionsLoading } = useQuery<TimerSessionWithTimer[]>({
    queryKey: ['sessions', format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      if (!user) return [];
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      
      const { data, error } = await supabase
        .from('timer_sessions')
        .select(`
          *,
          timers (id, name, category)
        `)
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString())
        .not('duration_ms', 'is', null);

      if (error) {
        console.error('Error fetching sessions:', error);
        throw new Error(error.message);
      }
      return data as TimerSessionWithTimer[];
    },
    enabled: !!user,
  });

  // Get unique categories from timers
  const categories = Array.from(new Set(timers.map(timer => timer.category || "Uncategorized")));

  // Handle month navigation
  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1));
  };
  
  return (
    <motion.div 
      className="min-h-screen bg-background text-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <CalendarLayout title="Activity Calendar">
        <div className="flex justify-between items-center mb-6">
          <CalendarPageHeader
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categories={categories}
          />
          
          {user && timers.length < 50 && (
            <MockDataButton />
          )}
        </div>
        
        <CalendarContent
          currentMonth={currentMonth}
          handleMonthChange={handleMonthChange}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setCurrentMonth={setCurrentMonth}
          timers={timers} // Timers are still needed for deadlines, etc.
          sessions={sessions || []}
          sessionsLoading={sessionsLoading}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
        />
      </CalendarLayout>
    </motion.div>
  );
};

export default CalendarPage;
