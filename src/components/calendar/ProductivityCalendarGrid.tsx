import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Timer, TimerSessionWithTimer } from '../../types';
import { getTotalTimeForDate, getSessionsForDate, formatTime, getTimersWithDeadlinesForDate, formatDeadlineDisplay, getDeadlineUrgencyLevel, getDeadlinePriorityColor } from './CalendarUtils';
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
      const deadlineTimers = getTimersWithDeadlinesForDate(date, timers);
      
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
        deadlineTimers,
        deadlineCount: deadlineTimers.length,
        deadlineUrgency: getDeadlineUrgencyLevel(deadlineTimers),
        inCurrentMonth: isSameMonth(date, currentMonth),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
        isToday: isSameDay(date, new Date()),
        categories: topCategories,
        activityLevel: totalTime > 4 * 60 * 60 * 1000 ? 'high' : 
                     totalTime > 2 * 60 * 60 * 1000 ? 'medium' : 
                     totalTime > 0 ? 'low' : 'none'
      };
    });
  }, [currentMonth, sessions, selectedDate, timers]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
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
          
          {/* Calendar days - simplified animations for performance */}
          {calendarDays.map((day, index) => (
            <div
              key={`${day.date.getDate()}-${day.date.getMonth()}`}
              className={`
                relative p-2 h-24 cursor-pointer rounded-md transition-colors duration-200
                ${day.inCurrentMonth ? 'hover:bg-muted/50' : 'opacity-50'}
                ${day.isSelected ? 'bg-primary/10 border-2 border-primary' : 'border border-border/20'}
                ${day.isToday ? 'ring-2 ring-primary/50' : ''}
              `}
              onClick={() => setSelectedDate(day.date)}
              title={`${format(day.date, 'MMMM d, yyyy')}${day.timerCount > 0 ? `\n${day.timerCount} session${day.timerCount !== 1 ? 's' : ''} - ${formatTime(day.totalTime)}` : ''}${day.deadlineCount > 0 ? `\nDeadlines: ${day.deadlineTimers.map(t => t.name).join(', ')}` : ''}`}
            >
              {/* Date number */}
              <div className={`
                text-sm font-medium mb-1
                ${day.isToday ? 'text-primary font-bold' : ''}
                ${!day.inCurrentMonth ? 'text-muted-foreground' : ''}
              `}>
                {format(day.date, 'd')}
              </div>
              
              {/* Deadline indicators - Top section */}
              {day.deadlineCount > 0 && (
                <div className="absolute top-6 left-1 right-1">
                  <div className="flex flex-wrap gap-1 mb-1">
                    {day.deadlineTimers.slice(0, 2).map((timer, i) => (
                      <div
                        key={timer.id}
                        className={`
                          text-xs px-1.5 py-0.5 rounded text-white font-medium
                          ${getDeadlinePriorityColor(timer.priority)}
                        `}
                        title={`Deadline: ${timer.name} (Priority: ${timer.priority || 'None'})`}
                      >
                        {formatDeadlineDisplay(timer)}
                      </div>
                    ))}
                    {day.deadlineCount > 2 && (
                      <div 
                        className="text-xs px-1.5 py-0.5 rounded bg-gray-500 text-white font-medium"
                        title={`+${day.deadlineCount - 2} more deadlines`}
                      >
                        +{day.deadlineCount - 2}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Session activity indicators - Middle section */}
              {day.timerCount > 0 && (
                <div className={`absolute ${day.deadlineCount > 0 ? 'top-12' : 'top-6'} right-1`}>
                  {/* Category dots */}
                  <div className="flex justify-end gap-1 mb-1">
                    {day.categories.slice(0, 3).map(([category], i) => (
                      <div
                        key={category}
                        className="w-2.5 h-2.5 rounded-full border border-white/50"
                        style={{ 
                          backgroundColor: getCategoryColor(category, false),
                          opacity: 0.9
                        }}
                        title={`${category}`}
                      />
                    ))}
                    {day.categories.length > 3 && (
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-400 border border-white/50" 
                           title={`+${day.categories.length - 3} more categories`} />
                    )}
                  </div>
                </div>
              )}
              
              {/* Bottom: Session info */}
              {day.timerCount > 0 && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="text-xs text-muted-foreground leading-tight">
                    {day.timerCount} session{day.timerCount !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs font-semibold leading-tight">
                    {formatTime(day.totalTime)}
                  </div>
                </div>
              )}
              
              {/* Activity level background indicator */}
              {day.activityLevel !== 'none' && (
                <div className={`
                  absolute inset-0 rounded-md border-2 pointer-events-none
                  ${day.activityLevel === 'high' ? 'bg-green-500/10 border-green-500/30' : 
                    day.activityLevel === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' : 
                    'bg-blue-500/10 border-blue-500/30'}
                `} />
              )}
              
              {/* Strong activity intensity bar */}
              {day.activityLevel !== 'none' && (
                <div className={`
                  absolute bottom-0 left-0 right-0 h-1.5 rounded-b-md
                  ${day.activityLevel === 'high' ? 'bg-green-500' : 
                    day.activityLevel === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}
                `} />
              )}
              
              {/* Deadline urgency left border */}
              {day.deadlineUrgency !== 'none' && (
                <div className={`
                  absolute top-0 left-0 bottom-0 w-1 rounded-l-md
                  ${day.deadlineUrgency === 'high' ? 'bg-red-500' : 
                    day.deadlineUrgency === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'}
                `} />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductivityCalendarGrid;