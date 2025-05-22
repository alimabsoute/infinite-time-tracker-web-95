
import React from 'react';
import { format, subMonths, addMonths } from 'date-fns';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface CalendarHeaderProps {
  currentMonth: Date;
  onMonthChange: (direction: 'prev' | 'next') => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentMonth, onMonthChange }) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
      <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onMonthChange('prev')}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onMonthChange('next')}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
};

export default CalendarHeader;
