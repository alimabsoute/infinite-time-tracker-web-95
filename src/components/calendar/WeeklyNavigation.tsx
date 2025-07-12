
import React from 'react';
import { format, addDays } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Boxes, LineChart as LineChartIcon } from 'lucide-react';

interface WeeklyNavigationProps {
  currentWeekStart: Date;
  onNavigateWeek: (direction: 'previous' | 'next') => void;
  chartType: 'bubble' | 'line';
  onChartTypeChange: (type: 'bubble' | 'line') => void;
}

const WeeklyNavigation: React.FC<WeeklyNavigationProps> = ({
  currentWeekStart,
  onNavigateWeek,
  chartType,
  onChartTypeChange
}) => {
  return (
    <div className="flex flex-row items-center justify-between pb-2">
      <div className="text-center text-sm text-muted-foreground">
        {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
      </div>
      <div className="flex gap-1">
        <Button 
          onClick={() => onNavigateWeek('previous')} 
          size="sm" 
          variant="outline" 
          className="h-8 w-8 p-0 rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          onClick={() => onNavigateWeek('next')} 
          size="sm" 
          variant="outline" 
          className="h-8 w-8 p-0 rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Tabs defaultValue={chartType} className="ml-2">
          <TabsList className="h-8">
            <TabsTrigger 
              value="bubble" 
              onClick={() => onChartTypeChange('bubble')}
              className="px-2 h-7"
            >
              <Boxes className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger 
              value="line" 
              onClick={() => onChartTypeChange('line')}
              className="px-2 h-7"
            >
              <LineChartIcon className="h-3 w-3" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default WeeklyNavigation;
