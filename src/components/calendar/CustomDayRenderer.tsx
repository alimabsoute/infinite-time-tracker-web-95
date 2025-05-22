
import React from 'react';
import { DayContentProps } from 'react-day-picker';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

interface ExtendedDayContentProps extends DayContentProps {
  selected?: boolean;
  modifiers?: Record<string, boolean>;
}

type GetTimeFunction = (date: Date) => number;
type GetColorFunction = (date: Date) => string;

export const renderDay = (
  getTime: GetTimeFunction,
  getColor: GetColorFunction
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
      return (
        <div 
          className={cn(
            "flex items-center justify-center h-9 w-9",
            rest.selected && "bg-primary text-primary-foreground rounded-md"
          )}
          {...rest}
        >
          <div>{date.getDate()}</div>
        </div>
      );
    }
    
    // Get tracked time for this date
    const timeTracked = getTime(date);
    const hasActivity = timeTracked > 0;
    
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
        title={formattedTime}
      >
        <div>{date.getDate()}</div>
        
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
        
        {/* Activity tooltip that appears on hover */}
        {hasActivity && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-popover p-1 rounded text-xs border border-border opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10 whitespace-nowrap pointer-events-none">
            {formattedTime}
          </div>
        )}
      </div>
    );
  };
};
