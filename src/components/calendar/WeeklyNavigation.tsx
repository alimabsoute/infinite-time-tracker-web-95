
import React from 'react';
import { format, addDays } from 'date-fns';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeeklyNavigationProps {
  currentWeekStart: Date;
  onNavigateWeek: (direction: 'previous' | 'next') => void;
}

const WeeklyNavigation: React.FC<WeeklyNavigationProps> = ({
  currentWeekStart,
  onNavigateWeek
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
      </div>
    </div>
  );
};

export default WeeklyNavigation;
