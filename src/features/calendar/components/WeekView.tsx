
import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Clock, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { TimerSessionWithTimer } from "../../types";
import { getSessionsForDate, formatTime } from "./CalendarUtils";
import SmartWeekNavigation from './SmartWeekNavigation';
import WeeklyStats from './WeeklyStats';
import WeeklyAnalysis from './WeeklyAnalysis';
import WeekDataSummary from './WeekDataSummary';
import DateRangeSelector from './DateRangeSelector';
import VisualizationErrorBoundary from './visualization/VisualizationErrorBoundary';
import VisualizationContainer from './visualization/VisualizationContainer';
import { useToast } from '@shared/hooks/use-toast';

interface WeekViewProps {
  selectedDate: Date;
  sessions: TimerSessionWithTimer[];
  setSelectedDate: (date: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ selectedDate, sessions, setSelectedDate }) => {
  const { toast } = useToast();

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => 
    startOfWeek(selectedDate || new Date())
  );
  
  // Date range state for visualization - default to past week
  const [visualizationStartDate, setVisualizationStartDate] = useState(() => subDays(new Date(), 6));
  const [visualizationEndDate, setVisualizationEndDate] = useState(() => new Date());
  

  // Update currentWeekStart when selectedDate changes significantly
  useEffect(() => {
    if (selectedDate) {
      const selectedWeekStart = startOfWeek(selectedDate);
      if (!isSameDay(selectedWeekStart, currentWeekStart)) {
        setCurrentWeekStart(selectedWeekStart);
      }
    }
  }, [selectedDate, currentWeekStart]);

  // Generate week data
  const weekData = useMemo(() => {
    
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
    
    return data;
  }, [currentWeekStart, sessions]);
  
  // Navigate to previous/next week (independent of visualization)
  const navigateWeek = (direction: 'previous' | 'next') => {
    const newWeekStart = direction === 'previous' 
      ? subWeeks(currentWeekStart, 1) 
      : addWeeks(currentWeekStart, 1);
    
    setCurrentWeekStart(newWeekStart);
  };

  // Handle smart navigation to a specific week with data
  const handleJumpToDataWeek = (weekStart: Date) => {
    setCurrentWeekStart(weekStart);
    setSelectedDate(weekStart); // Also update the selected date
  };

  // Handle bar/day click to update selected date
  const handleBarClick = (data: any) => {
    if (data && data.date) {
      setSelectedDate(data.date);
    }
  };

  // Handle bubble click for visualization
  const handleBubbleClick = (_bubble: any) => {
  };

  // Handle date range changes for visualization only
  const handleVisualizationDateRangeChange = (newStartDate: Date, newEndDate: Date) => {
    setVisualizationStartDate(newStartDate);
    setVisualizationEndDate(newEndDate);
  };

  // Handle applying date range to both visualization and weekly activity
  const handleApplyDateRange = async (startDate: Date, endDate: Date) => {
    // Update visualization dates
    setVisualizationStartDate(startDate);
    setVisualizationEndDate(endDate);
    
    // Update weekly activity to show the start of the selected range
    const newWeekStart = startOfWeek(startDate);
    setCurrentWeekStart(newWeekStart);
    setSelectedDate(startDate);

    // Show success feedback with enhanced messaging
    toast({
      title: "Date range applied successfully!",
      description: `Weekly Activity now displays ${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd')}. Both visualization and weekly chart are synchronized.`,
    });

    // Small delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 300));
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Week Data Summary */}
      <WeekDataSummary
        currentWeekStart={currentWeekStart}
        sessions={sessions}
      />

      <Card className="glass-effect mt-6 border border-border/30 shadow-lg transition-all duration-300 hover:shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock size={16} className="text-primary" /> 
            Weekly Activity - Multi-Layer Visualization
          </CardTitle>
          <div className="flex items-start gap-2 p-2 bg-blue-50/50 rounded-lg border border-blue-200/50">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">How it works:</p>
              <p className="text-xs mt-1">
                • The <strong>visualization below</strong> shows data for the selected date range<br/>
                • The <strong>weekly chart</strong> shows data for the current week (use navigation arrows)<br/>
                • Use the <strong>"Apply to Weekly Activity"</strong> button to sync both views
              </p>
            </div>
          </div>
          <SmartWeekNavigation
            currentWeekStart={currentWeekStart}
            onNavigateWeek={navigateWeek}
            sessions={sessions}
            onJumpToDataWeek={handleJumpToDataWeek}
          />
        </CardHeader>
        <CardContent>
          {/* Date Range Selector for Visualization with Apply functionality */}
          <DateRangeSelector
            startDate={visualizationStartDate}
            endDate={visualizationEndDate}
            onDateRangeChange={handleVisualizationDateRangeChange}
            onApplyDateRange={handleApplyDateRange}
            className="mb-4"
          />

          {/* Enhanced Multi-Layer Visualization Container */}
          <VisualizationErrorBoundary 
            fallback={
              <div className="h-[400px] flex items-center justify-center text-muted-foreground bg-yellow-50 rounded-lg">
                <div className="text-center">
                  <p className="text-yellow-600 font-medium">All visualizations failed to load</p>
                  <p className="text-yellow-500 text-sm mt-2">This might be due to browser compatibility issues</p>
                  <p className="text-yellow-400 text-xs mt-1">Sessions available: {sessions.length}</p>
                </div>
              </div>
            }
          >
            <VisualizationContainer
              sessions={sessions}
              startDate={visualizationStartDate}
              endDate={visualizationEndDate}
              onBubbleClick={handleBubbleClick}
            />
          </VisualizationErrorBoundary>
          
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
