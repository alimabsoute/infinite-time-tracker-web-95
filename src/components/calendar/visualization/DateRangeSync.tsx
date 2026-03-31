
import React, { useState } from 'react';
import { format, subDays } from 'date-fns';
import { CalendarIcon, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';

interface DateRangeSyncProps {
  visualizationStartDate: Date;
  visualizationEndDate: Date;
  weeklyActivityDate: Date;
  onVisualizationDateChange: (startDate: Date, endDate: Date) => void;
  onWeeklyActivityDateChange: (date: Date) => void;
  onSyncDates: (startDate: Date, endDate: Date) => void;
}

export const DateRangeSync: React.FC<DateRangeSyncProps> = ({
  visualizationStartDate,
  visualizationEndDate,
  weeklyActivityDate,
  onVisualizationDateChange,
  onSyncDates
}) => {
  const { toast } = useToast();
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = subDays(end, days - 1);
    onVisualizationDateChange(start, end);
  };

  const handleSyncToWeeklyActivity = async () => {
    setIsSyncing(true);
    try {
      await onSyncDates(visualizationStartDate, visualizationEndDate);
      toast({
        title: "Dates synchronized!",
        description: `Weekly Activity now shows ${format(visualizationStartDate, 'MMM dd')} - ${format(visualizationEndDate, 'MMM dd')}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const areDatesInSync = () => {
    const weekStart = new Date(weeklyActivityDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
    return Math.abs(weekStart.getTime() - visualizationStartDate.getTime()) < 24 * 60 * 60 * 1000;
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Date Range Synchronization - FIXED
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
          {areDatesInSync() ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Dates are synchronized</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-600 font-medium">Dates are not synchronized</span>
            </>
          )}
        </div>

        {/* Date Range Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span>Visualization Range:</span>
            <div className="flex items-center gap-2">
              <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    {format(visualizationStartDate, 'MMM dd')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={visualizationStartDate}
                    onSelect={(date) => {
                      if (date) {
                        onVisualizationDateChange(date, visualizationEndDate);
                        setIsStartOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <span className="text-muted-foreground">to</span>
              
              <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    {format(visualizationEndDate, 'MMM dd')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={visualizationEndDate}
                    onSelect={(date) => {
                      if (date) {
                        onVisualizationDateChange(visualizationStartDate, date);
                        setIsEndOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Weekly Activity: {format(weeklyActivityDate, 'MMM dd, yyyy')}
          </div>
        </div>

        {/* Quick Select Buttons */}
        <div className="flex gap-1 flex-wrap">
          {[7, 14, 30, 90].map((days) => (
            <Button
              key={days}
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(days)}
              className="text-xs h-6 px-2"
            >
              {days} days
            </Button>
          ))}
        </div>

        {/* Sync Button */}
        <Button
          onClick={handleSyncToWeeklyActivity}
          disabled={isSyncing || areDatesInSync()}
          className="w-full"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Synchronizing...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Apply to Weekly Activity
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DateRangeSync;
