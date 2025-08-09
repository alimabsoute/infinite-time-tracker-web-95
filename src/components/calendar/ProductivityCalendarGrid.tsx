import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Timer, TimerSessionWithTimer } from '../../types';
import { getTotalTimeForDate, getSessionsForDate, formatTime } from './CalendarUtils';
import { getCategoryColor } from './visualization/utils/ColorUtils';
import { motion } from 'framer-motion';

interface ProductivityCalendarGridProps {
  currentMonth: Date;
  handleMonthChange: (direction: 'prev' | 'next') => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  sessions: TimerSessionWithTimer[];
  timers: Timer[];
}

const ProductivityCalendarGrid: React.FC<ProductivityCalendarGridProps> = ({
  currentMonth,
  handleMonthChange,
  selectedDate,
  setSelectedDate,
  sessions,
  timers
}) => {
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    
    return eachDayOfInterval({ start, end }).map(date => {
      const dayTimers = getSessionsForDate(date, sessions);
      const totalTime = getTotalTimeForDate(date, sessions);
      
      // Get category breakdown for activity dots
      const categories = dayTimers.reduce((acc, session) => {
        const category = session.timers?.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topCategories = Object.entries(categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

      return {
        date,
        totalTime,
        timerCount: dayTimers.length,
        inCurrentMonth: isSameMonth(date, currentMonth),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
        isToday: isSameDay(date, new Date()),
        categories: topCategories,
        activityLevel: totalTime > 4 * 60 * 60 * 1000 ? 'high' : 
                     totalTime > 2 * 60 * 60 * 1000 ? 'medium' : 
                     totalTime > 0 ? 'low' : 'none'
      };
    });
  }, [currentMonth, sessions, selectedDate]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <h3 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMonthChange('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMonthChange('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week headers */}
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <motion.div
              key={day.date.toISOString()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.01 }}
              className={`
                relative p-2 h-20 cursor-pointer rounded-md transition-all duration-200
                ${day.inCurrentMonth ? 'hover:bg-muted/50' : 'opacity-50'}
                ${day.isSelected ? 'bg-primary/10 border-2 border-primary' : 'border border-border/20'}
                ${day.isToday ? 'ring-2 ring-primary/50' : ''}
              `}
              onClick={() => setSelectedDate(day.date)}
            >
              {/* Date number */}
              <div className={`
                text-sm font-medium
                ${day.isToday ? 'text-primary font-bold' : ''}
                ${!day.inCurrentMonth ? 'text-muted-foreground' : ''}
              `}>
                {format(day.date, 'd')}
              </div>
              
              {/* Activity indicators */}
              {day.timerCount > 0 && (
                <div className="absolute top-1 right-1 space-y-1">
                  {/* Category dots */}
                  <div className="flex gap-1">
                    {day.categories.map(([category], i) => (
                      <div
                        key={category}
                        className="w-2 h-2 rounded-full"
                        style={{ 
                          backgroundColor: getCategoryColor(category, false),
                          opacity: 0.8 
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Timer count and time */}
              {day.timerCount > 0 && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="text-xs text-muted-foreground">
                    {day.timerCount} timer{day.timerCount !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs font-medium">
                    {formatTime(day.totalTime)}
                  </div>
                </div>
              )}
              
              {/* Activity level indicator */}
              {day.activityLevel !== 'none' && (
                <div className={`
                  absolute bottom-0 left-0 right-0 h-1 rounded-b-md
                  ${day.activityLevel === 'high' ? 'bg-green-500' : 
                    day.activityLevel === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}
                `} />
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductivityCalendarGrid;