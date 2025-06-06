
import React from 'react';
import { DayContentProps } from 'react-day-picker';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { Timer } from '../../types';
import { format, isPast, isToday } from 'date-fns';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { getTimersWithDeadlinesForDate } from './CalendarUtils';

interface ExtendedDayContentProps extends DayContentProps {
  selected?: boolean;
  modifiers?: Record<string, boolean>;
}

type GetTimeFunction = (date: Date) => number;
type GetColorFunction = (date: Date) => string;
type GetAllTimersFunction = (date: Date) => Timer[];

export const renderDay = (
  getTime: GetTimeFunction,
  getColor: GetColorFunction,
  getAllTimers: GetAllTimersFunction
) => {
  return function DayContent(props: ExtendedDayContentProps) {
    const { date, selected, modifiers, ...otherProps } = props;
    
    if (!date) {
      return <div>-</div>;
    }
    
    const allDayTimers = getAllTimers(date);
    const timeTracked = getTime(date);
    const hasActivity = timeTracked > 0;
    
    // Use the utility function for consistent deadline detection
    const deadlineTimers = getTimersWithDeadlinesForDate(date, allDayTimers);
    
    console.log(`CustomDayRenderer - ${format(date, 'yyyy-MM-dd')}:`, {
      totalTimers: allDayTimers.length,
      deadlineTimers: deadlineTimers.length,
      deadlineDetails: deadlineTimers.map(t => ({ 
        name: t.name, 
        deadline: t.deadline ? format(new Date(t.deadline), 'yyyy-MM-dd HH:mm') : 'no deadline'
      }))
    });
    
    // Check for overdue deadlines
    const overdueDeadlines = deadlineTimers.filter(timer => 
      timer.deadline && 
      isPast(new Date(timer.deadline)) && 
      !isToday(new Date(timer.deadline))
    );
    
    const todayDeadlines = deadlineTimers.filter(timer =>
      timer.deadline &&
      isToday(new Date(timer.deadline))
    );
    
    const hasDeadlines = deadlineTimers.length > 0;
    const hasOverdueDeadlines = overdueDeadlines.length > 0;
    const hasTodayDeadlines = todayDeadlines.length > 0;
    
    const isSelected = selected || (modifiers && modifiers.selected);
    
    // Format time for tooltip
    const formattedTime = (() => {
      const totalSeconds = Math.floor(timeTracked / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return minutes > 0 ? `${minutes}m` : 'No activity';
    })();
    
    // Get activity level for visual intensity
    const getActivityLevel = () => {
      if (timeTracked === 0) return 0;
      if (timeTracked < 1800000) return 1; // Less than 30 mins
      if (timeTracked < 3600000) return 2; // Less than 1 hour
      if (timeTracked < 7200000) return 3; // Less than 2 hours
      if (timeTracked < 14400000) return 4; // Less than 4 hours
      return 5; // More than 4 hours
    };
    
    const activityLevel = getActivityLevel();
    
    // Enhanced deadline styling with stronger red highlighting
    const getDeadlineStyle = () => {
      if (hasOverdueDeadlines) {
        return "bg-red-100 border-2 border-red-600 text-red-900 dark:bg-red-950/60 dark:border-red-400 dark:text-red-100 shadow-red-200 dark:shadow-red-900/50 shadow-lg";
      }
      if (hasTodayDeadlines) {
        return "bg-red-50 border-2 border-red-500 text-red-800 dark:bg-red-950/40 dark:border-red-500 dark:text-red-200 shadow-red-100 dark:shadow-red-900/30 shadow-md";
      }
      if (hasDeadlines) {
        return "bg-red-25 border-2 border-red-400 text-red-700 dark:bg-red-950/20 dark:border-red-600 dark:text-red-300 shadow-red-50 dark:shadow-red-900/20";
      }
      return "";
    };
    
    const deadlineStyle = getDeadlineStyle();
    
    // Create tooltip content
    const tooltipContent = (
      <div className="max-w-64 p-1">
        <div className="font-semibold mb-2 text-sm">{format(date, 'EEEE, MMM d, yyyy')}</div>
        
        {hasDeadlines && (
          <div className={cn(
            "mb-2 p-2 rounded border-l-2",
            hasOverdueDeadlines ? "bg-red-100 border-red-500 dark:bg-red-950/30" :
            hasTodayDeadlines ? "bg-red-50 border-red-400 dark:bg-red-950/20" :
            "bg-red-25 border-red-300 dark:bg-red-950/10"
          )}>
            <div className={cn(
              "font-medium mb-1 text-xs",
              hasOverdueDeadlines ? "text-red-800 dark:text-red-200" :
              hasTodayDeadlines ? "text-red-700 dark:text-red-300" :
              "text-red-600 dark:text-red-400"
            )}>
              {hasOverdueDeadlines ? "⚠️ Overdue Deadlines" :
               hasTodayDeadlines ? "🔥 Today's Deadlines" :
               "📅 Upcoming Deadlines"}
            </div>
            {deadlineTimers.slice(0, 3).map((timer) => (
              <div key={timer.id} className={cn(
                "text-xs mb-1",
                hasOverdueDeadlines ? "text-red-700 dark:text-red-300" :
                hasTodayDeadlines ? "text-red-600 dark:text-red-400" :
                "text-red-500 dark:text-red-500"
              )}>
                • {timer.name}
                {timer.deadline && (
                  <span className="ml-1 font-mono">
                    {format(new Date(timer.deadline), 'HH:mm')}
                  </span>
                )}
              </div>
            ))}
            {deadlineTimers.length > 3 && (
              <div className="text-xs text-red-500 dark:text-red-400">
                +{deadlineTimers.length - 3} more deadline{deadlineTimers.length - 3 > 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {hasActivity && (
          <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-2 border-blue-500">
            <div className="font-medium text-blue-700 dark:text-blue-300 text-xs">Activity</div>
            <div className="text-blue-600 dark:text-blue-400 text-xs">{formattedTime} tracked</div>
            <div className="text-xs text-blue-500 dark:text-blue-500 mt-1">
              {allDayTimers.filter(t => new Date(t.createdAt).toDateString() === date.toDateString()).length} session{allDayTimers.filter(t => new Date(t.createdAt).toDateString() === date.toDateString()).length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {!hasActivity && !hasDeadlines && (
          <div className="text-xs text-muted-foreground">No activity or deadlines</div>
        )}
      </div>
    );

    const dayContent = (
      <motion.div 
        className={cn(
          "flex flex-col items-center justify-center h-9 w-9 relative group cursor-pointer rounded-md transition-all duration-200",
          // Apply deadline styling first, then handle selection
          deadlineStyle,
          // Override with selection styling if selected
          isSelected && !hasDeadlines && "bg-primary text-primary-foreground",
          isSelected && hasDeadlines && "ring-2 ring-primary ring-offset-1",
          // Hover effects
          !isSelected && !hasDeadlines && "hover:bg-secondary/50",
          !isSelected && hasDeadlines && "hover:brightness-110"
        )}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="relative z-10 font-medium">{date.getDate()}</div>
        
        {/* Enhanced Activity indicator with multiple levels */}
        {hasActivity && (
          <div className="absolute bottom-1 w-full flex justify-center">
            <div 
              className={cn(
                "h-1 rounded-sm transition-all duration-300",
                isSelected ? "w-5 bg-primary-foreground/70" : "w-4",
                activityLevel === 1 && !isSelected && "bg-blue-400/60 w-2",
                activityLevel === 2 && !isSelected && "bg-blue-500/70 w-3",
                activityLevel === 3 && !isSelected && "bg-blue-600/80 w-4",
                activityLevel === 4 && !isSelected && "bg-blue-700/90 w-5",
                activityLevel === 5 && !isSelected && "bg-blue-800 w-6",
                // Adjust for deadline styling
                hasDeadlines && !isSelected && "bg-white/80"
              )}
            />
          </div>
        )}
        
        {/* Enhanced Deadline indicators */}
        {hasDeadlines && (
          <motion.div 
            className={cn(
              "absolute -top-0.5 -right-0.5 rounded-full text-xs font-bold min-w-5 h-5 flex items-center justify-center border-2 border-white dark:border-gray-900",
              hasOverdueDeadlines ? "bg-red-600 text-white shadow-lg" : 
              hasTodayDeadlines ? "bg-red-500 text-white shadow-md" :
              "bg-red-400 text-white"
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            {deadlineTimers.length}
          </motion.div>
        )}
      </motion.div>
    );

    // Use HoverCard instead of Tooltip to prevent flickering
    if (hasActivity || hasDeadlines) {
      return (
        <HoverCard openDelay={300} closeDelay={100}>
          <HoverCardTrigger asChild>
            {dayContent}
          </HoverCardTrigger>
          <HoverCardContent side="top" className="z-50 w-auto p-3">
            {tooltipContent}
          </HoverCardContent>
        </HoverCard>
      );
    }

    return dayContent;
  };
};
