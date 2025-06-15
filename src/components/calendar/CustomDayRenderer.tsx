
import React from 'react';
import { DayContentProps } from 'react-day-picker';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { Timer } from '../../types';
import { format, isPast, isToday } from 'date-fns';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { getTimersWithDeadlinesForDate, getTimersForDate } from './CalendarUtils';

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
    const createdTimers = getTimersForDate(date, allDayTimers);
    const hasActivity = timeTracked > 0;
    
    // Use the utility function for consistent deadline detection
    const deadlineTimers = getTimersWithDeadlinesForDate(date, allDayTimers);
    
    console.log(`CustomDayRenderer - ${format(date, 'yyyy-MM-dd')}:`, {
      totalTimers: allDayTimers.length,
      createdTimers: createdTimers.length,
      deadlineTimers: deadlineTimers.length,
      timeTracked: timeTracked,
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
    const hasTimerSessions = createdTimers.length > 0;
    
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
    
    // Get activity level for visual intensity - more prominent indicators
    const getActivityLevel = () => {
      if (timeTracked === 0) return 0;
      if (timeTracked < 900000) return 1; // Less than 15 mins
      if (timeTracked < 1800000) return 2; // Less than 30 mins
      if (timeTracked < 3600000) return 3; // Less than 1 hour
      if (timeTracked < 7200000) return 4; // Less than 2 hours
      return 5; // More than 2 hours
    };
    
    const activityLevel = getActivityLevel();
    
    // Enhanced deadline styling with stronger contrast
    const getDeadlineStyle = () => {
      if (hasOverdueDeadlines) {
        return "bg-red-200 border-2 border-red-700 text-red-900 dark:bg-red-900/80 dark:border-red-300 dark:text-red-100 shadow-lg shadow-red-500/30";
      }
      if (hasTodayDeadlines) {
        return "bg-red-100 border-2 border-red-600 text-red-800 dark:bg-red-900/60 dark:border-red-400 dark:text-red-200 shadow-md shadow-red-400/25";
      }
      if (hasDeadlines) {
        return "bg-red-50 border-2 border-red-500 text-red-700 dark:bg-red-900/40 dark:border-red-500 dark:text-red-300 shadow-sm shadow-red-300/20";
      }
      return "";
    };
    
    const deadlineStyle = getDeadlineStyle();
    
    // Enhanced activity styling for better visibility
    const getActivityStyle = () => {
      if (!hasActivity && !hasDeadlines) return "";
      if (hasDeadlines) return ""; // Deadline styling takes precedence
      
      if (activityLevel >= 4) {
        return "bg-blue-200 border-2 border-blue-700 text-blue-900 dark:bg-blue-900/80 dark:border-blue-300 dark:text-blue-100 shadow-md shadow-blue-500/25";
      }
      if (activityLevel >= 2) {
        return "bg-blue-100 border-2 border-blue-600 text-blue-800 dark:bg-blue-900/60 dark:border-blue-400 dark:text-blue-200 shadow-sm shadow-blue-400/20";
      }
      return "bg-blue-50 border border-blue-400 text-blue-700 dark:bg-blue-900/40 dark:border-blue-500 dark:text-blue-300";
    };
    
    const activityStyle = getActivityStyle();
    
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

        {hasTimerSessions && (
          <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-2 border-blue-500 mb-2">
            <div className="font-medium text-blue-700 dark:text-blue-300 text-xs">Timer Sessions</div>
            <div className="text-blue-600 dark:text-blue-400 text-xs">{formattedTime} tracked</div>
            <div className="text-xs text-blue-500 dark:text-blue-500 mt-1">
              {createdTimers.length} session{createdTimers.length !== 1 ? 's' : ''} created
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
          // Apply styling based on priority: deadlines > activity > default
          deadlineStyle || activityStyle,
          // Override with selection styling if selected
          isSelected && !hasDeadlines && !hasActivity && "bg-primary text-primary-foreground",
          isSelected && (hasDeadlines || hasActivity) && "ring-2 ring-primary ring-offset-1 ring-offset-background"
        )}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="relative z-10 font-medium">{date.getDate()}</div>
        
        {/* Enhanced Activity indicator - more prominent */}
        {hasActivity && (
          <div className="absolute bottom-0.5 w-full flex justify-center">
            <div 
              className={cn(
                "h-1.5 rounded-sm transition-all duration-300",
                isSelected ? "w-6 bg-primary-foreground/80" : "w-5",
                activityLevel === 1 && !isSelected && "bg-blue-500/70 w-3",
                activityLevel === 2 && !isSelected && "bg-blue-600/80 w-4",
                activityLevel === 3 && !isSelected && "bg-blue-700/90 w-5",
                activityLevel === 4 && !isSelected && "bg-blue-800/95 w-6",
                activityLevel === 5 && !isSelected && "bg-blue-900 w-7",
                // Adjust for deadline styling
                hasDeadlines && !isSelected && "bg-white/90 shadow-sm"
              )}
            />
          </div>
        )}
        
        {/* Timer sessions indicator - separate from activity bar */}
        {hasTimerSessions && (
          <div className="absolute top-0.5 left-0.5">
            <motion.div 
              className={cn(
                "w-2 h-2 rounded-full border border-white dark:border-gray-900",
                hasDeadlines ? "bg-white/90" : "bg-green-500"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            />
          </div>
        )}
        
        {/* Enhanced Deadline indicators */}
        {hasDeadlines && (
          <motion.div 
            className={cn(
              "absolute -top-0.5 -right-0.5 rounded-full text-xs font-bold min-w-5 h-5 flex items-center justify-center border-2 border-white dark:border-gray-900",
              hasOverdueDeadlines ? "bg-red-700 text-white shadow-lg shadow-red-600/40" : 
              hasTodayDeadlines ? "bg-red-600 text-white shadow-md shadow-red-500/30" :
              "bg-red-500 text-white shadow-sm shadow-red-400/20"
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

    // Use HoverCard with optimized delay
    if (hasActivity || hasDeadlines || hasTimerSessions) {
      return (
        <HoverCard openDelay={300} closeDelay={150}>
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
