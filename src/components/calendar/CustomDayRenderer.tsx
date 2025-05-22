
import React from 'react';
import { DayContentProps } from 'react-day-picker';
import { cn } from "@/lib/utils";

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
    
    return (
      <div 
        className={cn(
          "flex flex-col items-center justify-center h-9 w-9 relative",
          isSelected && "bg-primary text-primary-foreground rounded-md"
        )}
        {...rest}
      >
        <div>{date.getDate()}</div>
        {hasActivity && (
          <div 
            className="absolute bottom-1 w-4 h-1 rounded-sm" 
            style={{ backgroundColor: bgColor }}
          />
        )}
      </div>
    );
  };
};
