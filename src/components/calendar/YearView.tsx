
import React from 'react';
import { format, isSameMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface YearViewProps {
  currentMonth: Date;
  selectedDate: Date | undefined;
  setCurrentMonth: (date: Date) => void;
  setCalendarView: (view: 'month' | 'year') => void;
}

const YearView: React.FC<YearViewProps> = ({
  currentMonth,
  selectedDate,
  setCurrentMonth,
  setCalendarView,
}) => {
  return (
    <div className="w-full max-w-[800px] border border-border/40 rounded-md p-4">
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 12 }, (_, i) => {
          const monthDate = new Date(currentMonth.getFullYear(), i, 1);
          return (
            <Button 
              key={i}
              variant={isSameMonth(monthDate, selectedDate || new Date()) ? "default" : "outline"}
              size="sm"
              className="h-auto py-4 flex flex-col gap-1"
              onClick={() => {
                setCurrentMonth(monthDate);
                setCalendarView('month');
              }}
            >
              <span>{format(monthDate, 'MMM')}</span>
              <span className="text-xs opacity-70">{format(monthDate, 'yyyy')}</span>
            </Button>
          );
        })}
      </div>
      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1))}
        >
          <ArrowLeft size={14} className="mr-1" />
          {currentMonth.getFullYear() - 1}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(new Date())}
        >
          Current Year
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1))}
        >
          {currentMonth.getFullYear() + 1}
          <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default YearView;
