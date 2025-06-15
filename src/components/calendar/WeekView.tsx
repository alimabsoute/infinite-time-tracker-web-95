
import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfWeek, addDays, subWeeks, addWeeks } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { TimerSessionWithTimer } from "../../types";
import { getSessionsForDate, formatTime } from "./CalendarUtils";
import WeeklyNavigation from './WeeklyNavigation';
import WeeklyChart from './WeeklyChart';
import WeeklyStats from './WeeklyStats';

interface WeekData {
  date: Date;
  day: string;
  totalHours: number;
  timers: number; // Note: this now represents session count
}

interface WeekViewProps {
  selectedDate: Date;
  sessions: TimerSessionWithTimer[];
  setSelectedDate: (date: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ selectedDate, sessions, setSelectedDate }) => {
  // State for week navigation and chart type
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(selectedDate || new Date())
  );
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  
  // Update currentWeekStart when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setCurrentWeekStart(startOfWeek(selectedDate));
    }
  }, [selectedDate]);

  // Generate week data dynamically based on current week start and sessions
  const weekData = useMemo(() => {
    const data = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(currentWeekStart, i);
      const daySessions = getSessionsForDate(date, sessions);
      const totalTime = daySessions.reduce((total, session) => total + (session.duration_ms || 0), 0);
      
      return {
        date,
        day: format(date, 'EEE'),
        totalHours: totalTime / 3600000, // Convert to hours
        timers: daySessions.length // Represents session count
      };
    });
    
    console.log('WeekView - Generated weekData from sessions:', data);
    return data;
  }, [currentWeekStart, sessions]);
  
  // Navigate to previous/next week
  const navigateWeek = (direction: 'previous' | 'next') => {
    setCurrentWeekStart(prevDate => 
      direction === 'previous' 
        ? subWeeks(prevDate, 1) 
        : addWeeks(prevDate, 1)
    );
  };

  // Calculate average hours per day for reference line
  const averageHours = useMemo(() => {
    const totalHours = weekData.reduce((sum, day) => sum + day.totalHours, 0);
    const avg = totalHours > 0 ? totalHours / 7 : 0;
    console.log('WeekView - Average hours:', avg);
    return avg;
  }, [weekData]);
  
  // Handle bar/day click to update selected date
  const handleBarClick = (data: any) => {
    if (data && data.date) {
      setSelectedDate(data.date);
      console.log("WeekView - Selected date:", format(data.date, 'yyyy-MM-dd'));
    }
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
            Weekly Activity
          </CardTitle>
          <WeeklyNavigation
            currentWeekStart={currentWeekStart}
            onNavigateWeek={navigateWeek}
            chartType={chartType}
            onChartTypeChange={setChartType}
          />
        </CardHeader>
        <CardContent>
          <WeeklyChart
            weekData={weekData}
            chartType={chartType}
            selectedDate={selectedDate}
            averageHours={averageHours}
            hoveredDay={hoveredDay}
            onHoverDay={setHoveredDay}
            onBarClick={handleBarClick}
            formatTime={formatTime}
          />
          
          <WeeklyStats
            weekData={weekData}
            selectedDate={selectedDate}
            formatTime={formatTime}
            onDayClick={(day) => handleBarClick(day)}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WeekView;
