import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Activity } from "lucide-react";
import CalendarMainView from "./CalendarMainView";
import WeekView from "./WeekView";
import ActivityVisualization from "./ActivityVisualization";
import { Timer, TimerSessionWithTimer } from "../../types";
import { formatTime } from "./CalendarUtils";

interface CalendarContentProps {
  currentMonth: Date;
  handleMonthChange: (direction: 'prev' | 'next') => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  setCurrentMonth: (date: Date) => void;
  timers: Timer[];
  sessions: TimerSessionWithTimer[];
  sessionsLoading: boolean;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: string[];
}

const CalendarContent: React.FC<CalendarContentProps> = ({
  currentMonth,
  handleMonthChange,
  selectedDate,
  setSelectedDate,
  setCurrentMonth,
  timers,
  sessions,
  sessionsLoading,
  categoryFilter,
  setCategoryFilter,
  categories,
}) => {
  return (
    <Tabs defaultValue="calendar" className="w-full mb-6">
      <TabsList className="grid grid-cols-2 w-full mb-4">
        <TabsTrigger value="calendar">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Calendar
        </TabsTrigger>
        <TabsTrigger value="analytics">
          <Activity className="mr-2 h-4 w-4" />
          Advanced Analytics
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="calendar" className="mt-0">
        <CalendarMainView
          currentMonth={currentMonth}
          handleMonthChange={handleMonthChange}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setCurrentMonth={setCurrentMonth}
          timers={timers}
          sessions={sessions}
          filteredTimers={[]} // This is deprecated now
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
        />
        
        {selectedDate && (
          <WeekView 
            selectedDate={selectedDate}
            sessions={sessions}
            timers={timers}
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
            filteredTimers={timers} // This component might need deeper changes
            sessions={sessions}
            formatTime={formatTime}
          />
        </motion.div>
      </TabsContent>
    </Tabs>
  );
};

export default CalendarContent;
