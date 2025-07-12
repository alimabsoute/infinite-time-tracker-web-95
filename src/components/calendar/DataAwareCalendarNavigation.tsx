
import React, { useMemo } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ArrowLeft, ArrowRight, Database, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { TimerSessionWithTimer } from "../../types";
import { getMonthsWithData, findNearestMonthWithData } from "./CalendarNavigationUtils";

interface DataAwareCalendarNavigationProps {
  currentMonth: Date;
  calendarView: 'month' | 'year';
  toggleYearView: () => void;
  goToToday: () => void;
  setCurrentMonth: (date: Date) => void;
  sessions: TimerSessionWithTimer[];
}

const DataAwareCalendarNavigation: React.FC<DataAwareCalendarNavigationProps> = ({
  currentMonth,
  calendarView,
  toggleYearView,
  goToToday,
  setCurrentMonth,
  sessions,
}) => {
  // Get months with data
  const monthsWithData = useMemo(() => getMonthsWithData(sessions), [sessions]);
  
  // Check if current month has data
  const currentMonthData = useMemo(() => {
    return monthsWithData.find(month => 
      month.date.getMonth() === currentMonth.getMonth() && 
      month.date.getFullYear() === currentMonth.getFullYear()
    );
  }, [monthsWithData, currentMonth]);

  // Find nearest months with data
  const nearestMonths = useMemo(() => {
    return {
      previous: findNearestMonthWithData(currentMonth, sessions, 'previous'),
      next: findNearestMonthWithData(currentMonth, sessions, 'next')
    };
  }, [currentMonth, sessions]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    if (hours > 0) return `${hours}h`;
    const minutes = Math.floor(ms / 60000);
    return `${minutes}m`;
  };

  const jumpToDataMonth = (monthDate: Date) => {
    setCurrentMonth(monthDate);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleYearView}
            className="text-xs flex items-center gap-1 h-8"
          >
            <CalendarIcon size={14} />
            {calendarView === 'month' ? 'Year View' : 'Month View'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday}
            className="text-xs h-8"
          >
            Today
          </Button>
        </div>
      </div>

      {/* Enhanced calendar navigation with data awareness */}
      <div className="space-y-2">
        <div className="flex justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="flex items-center"
          >
            <ArrowLeft size={14} className="mr-1" />
            {format(subMonths(currentMonth, 1), 'MMM')}
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
            className="flex items-center px-4"
          >
            Today
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="flex items-center"
          >
            {format(addMonths(currentMonth, 1), 'MMM')}
            <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>

        {/* Data status indicator */}
        {currentMonthData && currentMonthData.hasSignificantData && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
            <div className="flex items-center justify-center gap-2 text-xs text-blue-800 dark:text-blue-200">
              <Database className="h-3 w-3" />
              <span>{currentMonthData.sessionCount} sessions</span>
              <span>•</span>
              <span>{formatTime(currentMonthData.totalTime)} total</span>
            </div>
          </div>
        )}

        {/* Smart navigation for months without data */}
        {(!currentMonthData || !currentMonthData.hasSignificantData) && monthsWithData.some(m => m.hasSignificantData) && (
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-2">
                  No timer data for {format(currentMonth, 'MMMM yyyy')}. Jump to months with activity:
                </p>
                <div className="flex flex-wrap gap-2">
                  {nearestMonths.previous && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-yellow-300 hover:bg-yellow-100"
                      onClick={() => jumpToDataMonth(nearestMonths.previous!)}
                    >
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      {format(nearestMonths.previous, 'MMM yyyy')}
                      <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
                        {formatTime(monthsWithData.find(m => 
                          m.date.getTime() === nearestMonths.previous!.getTime()
                        )?.totalTime || 0)}
                      </Badge>
                    </Button>
                  )}
                  {nearestMonths.next && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-yellow-300 hover:bg-yellow-100"
                      onClick={() => jumpToDataMonth(nearestMonths.next!)}
                    >
                      {format(nearestMonths.next, 'MMM yyyy')}
                      <ArrowRight className="h-3 w-3 ml-1" />
                      <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
                        {formatTime(monthsWithData.find(m => 
                          m.date.getTime() === nearestMonths.next!.getTime()
                        )?.totalTime || 0)}
                      </Badge>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataAwareCalendarNavigation;
