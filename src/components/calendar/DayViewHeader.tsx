
import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from "lucide-react";

interface DayViewHeaderProps {
  selectedDate: Date | undefined;
}

const DayViewHeader: React.FC<DayViewHeaderProps> = ({ selectedDate }) => {
  if (!selectedDate) return null;

  return (
    <div className="mb-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <CalendarIcon size={16} className="text-primary" />
        <h3 className="font-medium">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h3>
      </div>
    </div>
  );
};

export default DayViewHeader;
