
import React from 'react';
import { DayContentProps } from 'react-day-picker';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { Timer } from '../../types';

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
    
    if (date > today) {
      // Check for deadlines on future dates
      const dayTimers = getTimers(date);
      const deadlineTimers = dayTimers.filter(timer => 
        timer.deadline && 
        new Date(timer.deadline).toDateString() === date.toDateString()
      );
      
      return (
        <div 
          className={cn(
            "flex flex-col items-center justify-center h-9 w-9 relative group",
            rest.selected && "bg-primary text-primary-foreground rounded-md"
          )}
          {...rest}
        >
          <div>{date.getDate()}</div>
          
          {deadlineTimers.length > 0 && (
            <>
              <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-background" />
              
              {/* Deadline tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-popover p-2 rounded text-xs border border-border opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10 whitespace-nowrap pointer-events-none max-w-48">
                <div className="font-semibold mb-1">Deadlines:</div>
                {deadlineTimers.slice(0, 3).map((timer, index) => (
                  <div key={timer.id} className="text-xs">
                    • {timer.name}
                  </div>
                ))}
                {deadlineTimers.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{deadlineTimers.length - 3} more
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      );
    }
    
    // Get tracked time and timers for this date
    const timeTracked = getTime(date);
    const hasActivity = timeTracked > 0;
    const dayTimers = getTimers(date);
    
    // Check for deadlines
    const deadlineTimers = dayTimers.filter(timer => 
      timer.deadline && 
      new Date(timer.deadline).toDateString() === date.toDateString()
    );
    
    // Get background color based on activity level
    const bgColor = getColor(date);
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
    
    return (
      <div 
        className={cn(
          "flex flex-col items-center justify-center h-9 w-9 relative group",
          isSelected ? "bg-primary text-primary-foreground rounded-md" : "hover:bg-secondary/50 rounded-md transition-colors"
        )}
        {...rest}
        title={`${formattedTime}${deadlineTimers.length > 0 ? ` • ${deadlineTimers.length} deadline${deadlineTimers.length > 1 ? 's' : ''}` : ''}`}
      >
        <div>{date.getDate()}</div>
        
        {/* Activity indicator */}
        {hasActivity && (
          <div className="absolute bottom-1.5 w-full flex justify-center">
            <div 
              className={cn(
                "h-1 rounded-sm transition-all duration-300 transform-gpu",
                isSelected ? "w-5 bg-primary-foreground/70" : "w-4"
              )}
              style={{ 
                backgroundColor: !isSelected ? bgColor : undefined,
              }}
            />
          </div>
        )}
        
        {/* Deadline indicator */}
        {deadlineTimers.length > 0 && (
          <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-background" />
        )}
        
        {/* Enhanced tooltip with activity and deadlines */}
        {(hasActivity || deadlineTimers.length > 0) && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-popover p-2 rounded text-xs border border-border opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10 whitespace-nowrap pointer-events-none max-w-48">
            {hasActivity && (
              <div className="mb-1">
                <span className="font-semibold">Activity:</span> {formattedTime}
              </div>
            )}
            {deadlineTimers.length > 0 && (
              <div>
                <div className="font-semibold mb-1">Deadlines:</div>
                {deadlineTimers.slice(0, 3).map((timer, index) => (
                  <div key={timer.id} className="text-xs">
                    • {timer.name} ({timer.deadline ? new Date(timer.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''})
                  </div>
                ))}
                {deadlineTimers.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{deadlineTimers.length - 3} more
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
};
