
import React from 'react';
import { Badge } from "@shared/components/ui/badge";
import { Progress } from "@shared/components/ui/progress";
import { Target, TrendingUp } from "lucide-react";

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

  // Determine productivity level
  const getProductivityLevel = () => {
    const hours = totalTrackedTime / 3600000;
    if (hours >= 8) return { label: "Highly Productive", color: "text-green-600 dark:text-green-400" };
    if (hours >= 6) return { label: "Very Productive", color: "text-blue-600 dark:text-blue-400" };
    if (hours >= 4) return { label: "Productive", color: "text-purple-600 dark:text-purple-400" };
    if (hours >= 2) return { label: "Moderately Active", color: "text-amber-600 dark:text-amber-400" };
    if (hours > 0) return { label: "Light Activity", color: "text-gray-600 dark:text-gray-400" };
    return { label: "No Activity", color: "text-gray-400" };
  };

  const productivityLevel = getProductivityLevel();

  return (
    <>
      {/* Total time summary with enhanced visuals */}
      <div className="bg-gradient-to-r from-secondary/20 to-secondary/10 p-4 rounded-lg mb-4 border border-secondary/50">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Daily Progress</span>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-lg">
              {formatTime(totalTrackedTime)}
            </div>
            <div className={`text-xs font-medium ${productivityLevel.color}`}>
              {productivityLevel.label}
            </div>
          </div>
        </div>
        
        <Progress 
          className="h-3 mb-2" 
          value={progressPercentage}
        />
        
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>0h</span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {Math.round(progressPercentage)}% of 8h goal
          </span>
          <span>8h</span>
        </div>
      </div>
      
      {/* Session count with additional stats */}
      {sessionCount > 0 && (
        <div className="mb-4 space-y-2">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="bg-primary/10 text-primary-foreground/90">
              {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'} tracked
            </Badge>
            
            {sessionCount > 1 && (
              <Badge variant="secondary" className="text-xs">
                Avg: {formatTime(totalTrackedTime / sessionCount)} per session
              </Badge>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DayViewSummary;
