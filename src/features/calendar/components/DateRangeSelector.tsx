
import React, { useState } from 'react';
import { format, subDays } from 'date-fns';
import { CalendarIcon, X, Check, RefreshCw } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Calendar } from '@shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/ui/popover';
import { cn } from '@shared/lib/utils';

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  onApplyDateRange?: (startDate: Date, endDate: Date) => void;
  className?: string;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
  onApplyDateRange,
  className
}) => {
  const [isStartOpen, setIsStartOpen] = React.useState(false);
  const [isEndOpen, setIsEndOpen] = React.useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = subDays(end, days - 1);
    onDateRangeChange(start, end);
    setHasUnappliedChanges(true);
  };

  const resetToWeek = () => {
    const today = new Date();
    const weekStart = subDays(today, 6);
    onDateRangeChange(weekStart, today);
    setHasUnappliedChanges(true);
  };

  const handleDateChange = (newStartDate: Date, newEndDate: Date) => {
    onDateRangeChange(newStartDate, newEndDate);
    setHasUnappliedChanges(true);
  };

  const handleApply = async () => {
    if (!onApplyDateRange) return;
    
    setIsApplying(true);
    try {
      await onApplyDateRange(startDate, endDate);
      setHasUnappliedChanges(false);
    } finally {
      setIsApplying(false);
    }
  };

  const resetToCurrentWeek = () => {
    const today = new Date();
    const weekStart = subDays(today, 6);
    onDateRangeChange(weekStart, today);
    if (onApplyDateRange) {
      onApplyDateRange(weekStart, today);
    }
    setHasUnappliedChanges(false);
  };

  return (
    <div className={cn("flex flex-col gap-3 p-4 bg-muted/30 rounded-lg", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Select Date Range for Visualization</h4>
        {hasUnappliedChanges && (
          <div className="flex items-center gap-1 text-xs text-orange-600">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            Changes pending
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-xs flex items-center gap-1 hover:bg-accent"
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
                    handleDateChange(date, endDate);
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
                className="text-xs flex items-center gap-1 hover:bg-accent"
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
                    handleDateChange(startDate, date);
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
          className="text-xs h-7 hover:bg-accent"
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
          className="text-xs h-6 px-2 hover:bg-accent"
        >
          7 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickSelect(14)}
          className="text-xs h-6 px-2 hover:bg-accent"
        >
          14 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickSelect(30)}
          className="text-xs h-6 px-2 hover:bg-accent"
        >
          30 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickSelect(90)}
          className="text-xs h-6 px-2 hover:bg-accent"
        >
          90 days
        </Button>
      </div>

      {onApplyDateRange && (
        <div className="flex gap-2 pt-2 border-t border-border/30">
          <Button
            onClick={handleApply}
            disabled={!hasUnappliedChanges || isApplying}
            size="sm"
            className="flex-1 h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isApplying ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Applying to Weekly Activity...
              </>
            ) : (
              <>
                <Check className="h-3 w-3 mr-1" />
                Apply to Weekly Activity
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={resetToCurrentWeek}
            size="sm"
            className="h-8 hover:bg-accent"
            title="Reset to current week"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
