
import React from 'react';
import { format, subDays } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  className?: string;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
  className
}) => {
  const [isStartOpen, setIsStartOpen] = React.useState(false);
  const [isEndOpen, setIsEndOpen] = React.useState(false);

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = subDays(end, days - 1);
    onDateRangeChange(start, end);
  };

  const resetToWeek = () => {
    const today = new Date();
    const weekStart = subDays(today, 6);
    onDateRangeChange(weekStart, today);
  };

  return (
    <div className={cn("flex flex-col gap-3 p-4 bg-muted/30 rounded-lg", className)}>
      <h4 className="text-sm font-medium">Select Date Range</h4>
      
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs flex items-center gap-1"
              >
                <CalendarIcon className="h-3 w-3" />
                {format(startDate, 'MMM dd')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  if (date) {
                    onDateRangeChange(date, endDate);
                    setIsStartOpen(false);
                  }
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          <span className="text-muted-foreground text-xs">to</span>
          
          <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs flex items-center gap-1"
              >
                <CalendarIcon className="h-3 w-3" />
                {format(endDate, 'MMM dd')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  if (date) {
                    onDateRangeChange(startDate, date);
                    setIsEndOpen(false);
                  }
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={resetToWeek}
          className="text-xs h-7"
        >
          <X className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>

      <div className="flex gap-1 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickSelect(7)}
          className="text-xs h-6 px-2"
        >
          7 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickSelect(14)}
          className="text-xs h-6 px-2"
        >
          14 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickSelect(30)}
          className="text-xs h-6 px-2"
        >
          30 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickSelect(90)}
          className="text-xs h-6 px-2"
        >
          90 days
        </Button>
      </div>
    </div>
  );
};

export default DateRangeSelector;
