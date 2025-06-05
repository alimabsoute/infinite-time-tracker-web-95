
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DayViewSummaryProps {
  selectedDate: Date | undefined;
  totalTrackedTime: number;
  formatTime: (ms: number) => string;
  sessionCount: number;
}

const DayViewSummary: React.FC<DayViewSummaryProps> = ({
  selectedDate,
  totalTrackedTime,
  formatTime,
  sessionCount
}) => {
  if (!selectedDate) return null;

  // Calculate progress percentage (assuming 8-hour workday as 100%)
  const progressPercentage = Math.min(
    (totalTrackedTime / (8 * 3600000)) * 100, 
    100
  );

  return (
    <>
      {/* Total time summary */}
      <div className="bg-secondary/30 p-3 rounded-md mb-4 border border-secondary">
        <div className="flex justify-between items-center">
          <span className="text-sm">Total tracked time:</span>
          <span className="font-mono font-bold">
            {formatTime(totalTrackedTime)}
          </span>
        </div>
        <Progress 
          className="h-2 mt-2" 
          value={progressPercentage}
        />
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>0h</span>
          <span>8h</span>
        </div>
      </div>
      
      {/* Session count */}
      {sessionCount > 0 && (
        <div className="mb-4 text-center">
          <Badge variant="outline" className="bg-primary/10 text-primary-foreground/90">
            {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'} tracked
          </Badge>
        </div>
      )}
    </>
  );
};

export default DayViewSummary;
