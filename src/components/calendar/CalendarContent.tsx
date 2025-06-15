
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Activity, Crown } from "lucide-react";
import CalendarMainView from "./CalendarMainView";
import WeekView from "./WeekView";
import ActivityVisualization from "./ActivityVisualization";
import SessionDataDebug from "./SessionDataDebug";
import PremiumFeatureGate from "../premium/PremiumFeatureGate";
import PremiumBadge from "../premium/PremiumBadge";
import { Timer, TimerSessionWithTimer } from "../../types";
import { formatTime } from "./CalendarUtils";
import { useSubscription } from "@/contexts/SubscriptionContext";

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
  const { subscribed } = useSubscription();

  console.log('CalendarContent - Rendering with data:', {
    timersCount: timers.length,
    sessionsCount: sessions.length,
    sessionsLoading,
    selectedDate: selectedDate ? selectedDate.toISOString() : 'none'
  });

  return (
    <div className="space-y-4">
      {/* Debug Component - Remove after testing */}
      <SessionDataDebug sessions={sessions} selectedDate={selectedDate} />
      
      <Tabs defaultValue="calendar" className="w-full mb-6">
        <TabsList className="grid grid-cols-2 w-full mb-4">
          <TabsTrigger value="calendar">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="analytics" className="relative">
            <Activity className="mr-2 h-4 w-4" />
            Advanced Analytics
            {!subscribed && <Crown className="ml-1 h-3 w-3" />}
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
              setSelectedDate={setSelectedDate}
            />
          )}
        </TabsContent>
        
        <TabsContent value="analytics">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {subscribed ? (
              <ActivityVisualization
                filteredTimers={timers}
                sessions={sessions}
                formatTime={formatTime}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Advanced Analytics</h3>
                  <PremiumBadge />
                </div>
                <PremiumFeatureGate 
                  feature="Advanced Calendar Analytics" 
                  description="Unlock detailed productivity insights, heatmaps, trend analysis, and advanced calendar visualizations."
                />
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalendarContent;
