
import React from 'react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { Calendar as CalendarIcon, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@shared/components/ui/badge";

interface DayViewHeaderProps {
  selectedDate: Date | undefined;
  hasDeadlines?: boolean;
  hasOverdueDeadlines?: boolean;
}

const DayViewHeader: React.FC<DayViewHeaderProps> = ({ 
  selectedDate, 
  hasDeadlines = false,
  hasOverdueDeadlines = false 
}) => {
  if (!selectedDate) return null;

  const getDateLabel = () => {
    if (isToday(selectedDate)) return "Today";
    if (isTomorrow(selectedDate)) return "Tomorrow";
    if (isYesterday(selectedDate)) return "Yesterday";
    return null;
  };

  const dateLabel = getDateLabel();

  return (
    <div className="mb-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
        <CalendarIcon size={16} className="text-primary" />
        <h3 className="font-medium">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h3>
        {dateLabel && (
          <Badge variant="secondary" className="ml-2">
            {dateLabel}
          </Badge>
        )}
        {hasOverdueDeadlines && (
          <Badge variant="destructive" className="ml-2 flex items-center gap-1 animate-pulse">
            <AlertTriangle size={12} />
            Overdue
          </Badge>
        )}
        {hasDeadlines && !hasOverdueDeadlines && (
          <Badge variant="outline" className="ml-2 border-red-300 text-red-600 dark:border-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20">
            <Clock size={12} className="mr-1" />
            Deadlines Today
          </Badge>
        )}
      </div>
      
      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <Clock size={12} />
        <span>
          {hasDeadlines ? 
            "Review your deadlines and track time" : 
            "Track time to see your daily activity"
          }
        </span>
      </div>
    </div>
  );
};

export default DayViewHeader;
