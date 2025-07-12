
import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { TimerSessionWithTimer } from "../../types";
import { getSessionsForDate, formatTime } from "./CalendarUtils";
import WeeklyNavigation from './WeeklyNavigation';
import WeeklyStats from './WeeklyStats';
import WeeklyAnalysis from './WeeklyAnalysis';
import ErrorBoundary from '../ErrorBoundary';
import VisualizationContainer from './visualization/VisualizationContainer';

interface WeekData {
  date: Date;
  day: string;
  totalHours: number;
  timers: number;
}

interface WeekViewProps {
  selectedDate: Date;
  sessions: TimerSessionWithTimer[];
  setSelectedDate: (date: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ selectedDate, sessions, setSelectedDate }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => 
    startOfWeek(selectedDate || new Date())
  );
  
  console.log('🔍 WeekView - Initializing with selectedDate:', selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'none');
  console.log('🔍 WeekView - Initial currentWeekStart:', format(currentWeekStart, 'yyyy-MM-dd'));
  console.log('🔍 WeekView - Total sessions available:', sessions.length);

  // Update currentWeekStart when selectedDate changes significantly
  useEffect(() => {
    if (selectedDate) {
      const selectedWeekStart = startOfWeek(selectedDate);
      if (!isSameDay(selectedWeekStart, currentWeekStart)) {
        console.log('🔍 WeekView - Updating week start from', format(currentWeekStart, 'yyyy-MM-dd'), 'to', format(selectedWeekStart, 'yyyy-MM-dd'));
        setCurrentWeekStart(selectedWeekStart);
      }
    }
  }, [selectedDate, currentWeekStart]);

  // Generate week data
  const weekData = useMemo(() => {
    console.log('🔍 WeekView - Generating week data for week starting:', format(currentWeekStart, 'yyyy-MM-dd'));
    
    const data = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(currentWeekStart, i);
      const daySessions = getSessionsForDate(date, sessions);
      const totalTime = daySessions.reduce((total, session) => {
        return total + (session.duration_ms || 0);
      }, 0);
      
      return {
        date,
        day: format(date, 'EEE'),
        totalHours: totalTime / 3600000,
        timers: daySessions.length
      };
    });
    
    const totalWeekHours = data.reduce((sum, day) => sum + day.totalHours, 0);
    const daysWithData = data.filter(day => day.totalHours > 0).length;
    
    console.log('🔍 WeekView - Week summary:', {
      totalWeekHours: totalWeekHours.toFixed(2),
      daysWithData
    });
    
    return data;
  }, [currentWeekStart, sessions]);
  
  // Navigate to previous/next week
  const navigateWeek = (direction: 'previous' | 'next') => {
    const newWeekStart = direction === 'previous' 
      ? subWeeks(currentWeekStart, 1) 
      : addWeeks(currentWeekStart, 1);
    
    console.log('🔍 WeekView - Navigating', direction, 'to week starting:', format(newWeekStart, 'yyyy-MM-dd'));
    setCurrentWeekStart(newWeekStart);
  };

  // Handle bar/day click to update selected date
  const handleBarClick = (data: any) => {
    if (data && data.date) {
      console.log("🔍 WeekView - Bar clicked, setting selected date to:", format(data.date, 'yyyy-MM-dd'));
      setSelectedDate(data.date);
    }
  };

  // Handle bubble click for visualization
  const handleBubbleClick = (bubble: any) => {
    console.log('🔍 WeekView - Bubble clicked:', bubble);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="glass-effect mt-6 border border-border/30 shadow-lg transition-all duration-300 hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock size={16} className="text-primary" /> 
            Weekly Activity - Multi-Layer Visualization
          </CardTitle>
          <WeeklyNavigation
            currentWeekStart={currentWeekStart}
            onNavigateWeek={navigateWeek}
          />
        </CardHeader>
        <CardContent>
          {/* Enhanced Multi-Layer Visualization Container */}
          <ErrorBoundary fallback={
            <div className="h-[400px] flex items-center justify-center text-muted-foreground bg-yellow-50 rounded-lg">
              <div className="text-center">
                <p className="text-yellow-600 font-medium">All visualizations failed to load</p>
                <p className="text-yellow-500 text-sm mt-2">Please refresh the page</p>
                <p className="text-yellow-400 text-xs mt-1">Sessions available: {sessions.length}</p>
              </div>
            </div>
          }>
            <VisualizationContainer
              sessions={sessions}
              currentWeekStart={currentWeekStart}
              onBubbleClick={handleBubbleClick}
            />
          </ErrorBoundary>
          
          <WeeklyStats
            weekData={weekData}
            selectedDate={selectedDate}
            formatTime={formatTime}
            onDayClick={(day) => handleBarClick(day)}
          />
        </CardContent>
      </Card>
      
      <WeeklyAnalysis
        sessions={sessions}
        currentWeekStart={currentWeekStart}
      />
    </motion.div>
  );
};

export default WeekView;
