
import React from 'react';
import { DayContentProps } from 'react-day-picker';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { Timer } from '../../types';
import { format } from 'date-fns';

interface ExtendedDayContentProps extends DayContentProps {
  selected?: boolean;
  modifiers?: Record<string, boolean>;
}

type GetTimeFunction = (date: Date) => number;
type GetColorFunction = (date: Date) => string;
type GetTimersFunction = (date: Date) => Timer[];

export const renderDay = (
  getTime: GetTimeFunction,
  getColor: GetColorFunction,
  getTimers: GetTimersFunction
) => {
  return function DayContent(props: ExtendedDayContentProps) {
    const { date, ...rest } = props;
    
    if (!date) {
      return <div {...rest}>-</div>;
    }
    
    // Don't show activity indicators for future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dayTimers = getTimers(date);
    const timeTracked = getTime(date);
    const hasActivity = timeTracked > 0;
    
    // Check for deadlines
    const deadlineTimers = dayTimers.filter(timer => 
      timer.deadline && 
      new Date(timer.deadline).toDateString() === date.toDateString()
    );
    
    // Check for overdue deadlines (past deadlines that might still be relevant)
    const overdueDeadlines = dayTimers.filter(timer => 
      timer.deadline && 
      new Date(timer.deadline) < today &&
      new Date(timer.deadline).toDateString() === date.toDateString()
    );
    
    const isSelected = rest.selected || 
                       (rest.modifiers && rest.modifiers.selected);
    
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
    
    return (
      <motion.div 
        className={cn(
          "flex flex-col items-center justify-center h-9 w-9 relative group cursor-pointer",
          isSelected ? "bg-primary text-primary-foreground rounded-md" : "hover:bg-secondary/50 rounded-md transition-colors"
        )}
        {...rest}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="relative z-10">{date.getDate()}</div>
        
        {/* Enhanced Activity indicator with multiple levels */}
        {hasActivity && date <= today && (
          <div className="absolute bottom-1 w-full flex justify-center">
            <div 
              className={cn(
                "h-1 rounded-sm transition-all duration-300",
                isSelected ? "w-5 bg-primary-foreground/70" : "w-4",
                activityLevel === 1 && !isSelected && "bg-blue-400/60 w-2",
                activityLevel === 2 && !isSelected && "bg-blue-500/70 w-3",
                activityLevel === 3 && !isSelected && "bg-blue-600/80 w-4",
                activityLevel === 4 && !isSelected && "bg-blue-700/90 w-5",
                activityLevel === 5 && !isSelected && "bg-blue-800 w-6"
              )}
            />
          </div>
        )}
        
        {/* Enhanced Deadline indicators */}
        {deadlineTimers.length > 0 && (
          <motion.div 
            className={cn(
              "absolute top-0.5 right-0.5 rounded-full border border-background shadow-sm",
              overdueDeadlines.length > 0 ? "w-2.5 h-2.5 bg-red-600" : "w-2 h-2 bg-red-500"
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          />
        )}
        
        {/* Multiple deadlines indicator */}
        {deadlineTimers.length > 1 && (
          <div className="absolute top-1 right-1 w-1 h-1 bg-red-300 rounded-full border border-background" />
        )}
        
        {/* Enhanced tooltip with richer information */}
        {(hasActivity || deadlineTimers.length > 0) && (
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-popover p-3 rounded-lg text-xs border border-border opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-20 whitespace-nowrap pointer-events-none min-w-48 max-w-64">
            <div className="font-semibold mb-2 text-sm">{format(date, 'MMM d, yyyy')}</div>
            
            {hasActivity && (
              <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border-l-2 border-blue-500">
                <div className="font-medium text-blue-700 dark:text-blue-300">Activity</div>
                <div className="text-blue-600 dark:text-blue-400">{formattedTime} tracked</div>
                <div className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                  {dayTimers.length} session{dayTimers.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
            
            {deadlineTimers.length > 0 && (
              <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded border-l-2 border-red-500">
                <div className="font-medium text-red-700 dark:text-red-300 mb-1">
                  Deadline{deadlineTimers.length > 1 ? 's' : ''}
                </div>
                {deadlineTimers.slice(0, 3).map((timer) => (
                  <div key={timer.id} className="text-xs text-red-600 dark:text-red-400 mb-1">
                    • {timer.name}
                    {timer.deadline && (
                      <span className="ml-1 text-red-500">
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
          </div>
        )}
      </motion.div>
    );
  };
};
