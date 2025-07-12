
import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { TimerSessionWithTimer } from "../../types";
import { getSessionsForDate, formatTime } from "./CalendarUtils";
import WeeklyNavigation from './WeeklyNavigation';
import WeeklyChart from './WeeklyChart';
import WeeklyStats from './WeeklyStats';
import BubbleChart3D from './BubbleChart3D';
import WeeklyAnalysis from './WeeklyAnalysis';

interface WeekData {
  date: Date;
  day: string;
  totalHours: number;
  timers: number; // Session count
}

interface WeekViewProps {
  selectedDate: Date;
  sessions: TimerSessionWithTimer[];
  setSelectedDate: (date: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ selectedDate, sessions, setSelectedDate }) => {
  // Initialize with the week containing the selected date
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => 
    startOfWeek(selectedDate || new Date())
  );
  const [chartType, setChartType] = useState<'bubble' | 'line'>('bubble');
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  
  console.log('🔍 WeekView - Initializing with selectedDate:', selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'none');
  console.log('🔍 WeekView - Initial currentWeekStart:', format(currentWeekStart, 'yyyy-MM-dd'));
  console.log('🔍 WeekView - Total sessions available:', sessions.length);
  
  // Sample session data for debugging
  if (sessions.length > 0) {
    console.log('🔍 WeekView - Sample sessions:', sessions.slice(0, 3).map(s => ({
      id: s.id,
      start_time: s.start_time,
      duration_ms: s.duration_ms,
      timer_name: s.timers?.name
    })));
  }
  
  // Update currentWeekStart when selectedDate changes significantly
  useEffect(() => {
    if (selectedDate) {
      const selectedWeekStart = startOfWeek(selectedDate);
      // Only update if we're viewing a different week
      if (!isSameDay(selectedWeekStart, currentWeekStart)) {
        console.log('🔍 WeekView - Updating week start from', format(currentWeekStart, 'yyyy-MM-dd'), 'to', format(selectedWeekStart, 'yyyy-MM-dd'));
        setCurrentWeekStart(selectedWeekStart);
      }
    }
  }, [selectedDate, currentWeekStart]);

  // Generate week data based on current week start and sessions
  const weekData = useMemo(() => {
    console.log('🔍 WeekView - Generating week data for week starting:', format(currentWeekStart, 'yyyy-MM-dd'));
    console.log('🔍 WeekView - Processing', sessions.length, 'total sessions');
    
    const data = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(currentWeekStart, i);
      console.log(`🔍 WeekView - Processing day ${i + 1}: ${format(date, 'yyyy-MM-dd')}`);
      
      const daySessions = getSessionsForDate(date, sessions);
      const totalTime = daySessions.reduce((total, session) => {
        const duration = session.duration_ms || 0;
        console.log(`  Session ${session.id}: ${duration}ms (${(duration / 60000).toFixed(1)}min)`);
        return total + duration;
      }, 0);
      
      const result = {
        date,
        day: format(date, 'EEE'),
        totalHours: totalTime / 3600000,
        timers: daySessions.length
      };
      
      console.log(`🔍 WeekView - Day ${format(date, 'yyyy-MM-dd')} result:`, {
        sessionsCount: daySessions.length,
        totalTimeMs: totalTime,
        totalHours: result.totalHours.toFixed(2),
        hasData: totalTime > 0
      });
      
      return result;
    });
    
    const totalWeekHours = data.reduce((sum, day) => sum + day.totalHours, 0);
    const daysWithData = data.filter(day => day.totalHours > 0).length;
    
    console.log('🔍 WeekView - Week summary:', {
      totalWeekHours: totalWeekHours.toFixed(2),
      daysWithData,
      weekData: data.map(d => ({
        day: d.day,
        date: format(d.date, 'yyyy-MM-dd'),
        hours: d.totalHours.toFixed(2),
        sessions: d.timers
      }))
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

  // Calculate average hours per day
  const averageHours = useMemo(() => {
    const totalHours = weekData.reduce((sum, day) => sum + day.totalHours, 0);
    const avg = totalHours > 0 ? totalHours / 7 : 0;
    console.log('🔍 WeekView - Average hours calculated:', avg.toFixed(2), 'from total:', totalHours.toFixed(2));
    return avg;
  }, [weekData]);
  
  // Handle bar/day click to update selected date
  const handleBarClick = (data: any) => {
    if (data && data.date) {
      console.log("🔍 WeekView - Bar clicked, setting selected date to:", format(data.date, 'yyyy-MM-dd'));
      setSelectedDate(data.date);
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
          {chartType === 'bubble' ? (
            <BubbleChart3D
              sessions={sessions}
              currentWeekStart={currentWeekStart}
              onBubbleClick={(bubble) => {
                console.log('🔍 WeekView - Bubble clicked:', bubble.timerName);
              }}
            />
          ) : (
            <WeeklyChart
              weekData={weekData}
              chartType={chartType as 'line'}
              selectedDate={selectedDate}
              averageHours={averageHours}
              hoveredDay={hoveredDay}
              onHoverDay={setHoveredDay}
              onBarClick={handleBarClick}
              formatTime={formatTime}
            />
          )}
          
          <WeeklyStats
            weekData={weekData}
            selectedDate={selectedDate}
            formatTime={formatTime}
            onDayClick={(day) => handleBarClick(day)}
          />
        </CardContent>
      </Card>
      
      {/* Weekly Analysis Section */}
      <WeeklyAnalysis
        sessions={sessions}
        currentWeekStart={currentWeekStart}
      />
    </motion.div>
  );
};

export default WeekView;
