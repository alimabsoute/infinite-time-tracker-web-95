
import React from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ArrowLeft, ArrowRight } from 'lucide-react';

interface CalendarControlsProps {
  currentMonth: Date;
  calendarView: 'month' | 'year';
  toggleYearView: () => void;
  goToToday: () => void;
  setCurrentMonth: (date: Date) => void;
}

const CalendarControls: React.FC<CalendarControlsProps> = ({
  currentMonth,
  calendarView,
  toggleYearView,
  goToToday,
  setCurrentMonth,
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <div className="flex space-x-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleYearView}
            className="text-xs flex items-center gap-1 h-8"
          >
            <CalendarIcon size={14} />
            {calendarView === 'month' ? 'Year View' : 'Month View'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday}
            className="text-xs h-8"
          >
            Today
          </Button>
        </div>
      </div>

      {/* Calendar navigation */}
      <div className="flex justify-center mt-4 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="flex items-center"
        >
          <ArrowLeft size={14} className="mr-1" />
          {format(subMonths(currentMonth, 1), 'MMM')}
        </Button>
        
        <Button 
          variant="default" 
          size="sm"
          onClick={() => setCurrentMonth(new Date())}
          className="flex items-center"
        >
          Today
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="flex items-center"
        >
          {format(addMonths(currentMonth, 1), 'MMM')}
          <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>
    </>
  );
};

export default CalendarControls;
