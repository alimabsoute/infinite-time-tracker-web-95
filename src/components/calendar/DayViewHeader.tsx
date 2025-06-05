
import React from 'react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DayViewHeaderProps {
  selectedDate: Date | undefined;
}

const DayViewHeader: React.FC<DayViewHeaderProps> = ({ selectedDate }) => {
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
      <div className="flex items-center justify-center gap-2 mb-2">
        <CalendarIcon size={16} className="text-primary" />
        <h3 className="font-medium">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h3>
        {dateLabel && (
          <Badge variant="secondary" className="ml-2">
            {dateLabel}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <Clock size={12} />
        <span>Track time to see your daily activity</span>
      </div>
    </div>
  );
};

export default DayViewHeader;
