
import React from 'react';
import { format, isToday, isPast } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Calendar as CalendarIcon, AlertTriangle } from "lucide-react";
import { Timer } from "../../types";
import CategoryFilter from './CategoryFilter';
import { cn } from "@/lib/utils";

interface DayViewProps {
  selectedDate: Date | undefined;
  filteredTimers: Timer[];
  formatTime: (ms: number) => string;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  categories: string[];
}

const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  filteredTimers,
  formatTime,
  categoryFilter,
  setCategoryFilter,
  categories
}) => {
  // Get total time tracked for the selected date
  const totalTrackedTime = filteredTimers.reduce((sum, t) => sum + t.elapsedTime, 0);
  
  // Calculate progress percentage (assuming 8-hour workday as 100%)
  const progressPercentage = Math.min(
    (totalTrackedTime / (8 * 3600000)) * 100, 
    100
  );

  // Get deadlines for the selected date
  const deadlineTimers = selectedDate ? filteredTimers.filter(timer => 
    timer.deadline && 
    new Date(timer.deadline).toDateString() === selectedDate.toDateString()
  ) : [];

  // Sort deadline timers by deadline time
  const sortedDeadlineTimers = deadlineTimers.sort((a, b) => {
    if (!a.deadline || !b.deadline) return 0;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return (
    <>
      {/* Date header */}
      {selectedDate && (
        <div className="mb-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CalendarIcon size={16} className="text-primary" />
            <h3 className="font-medium">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
          </div>
        </div>
      )}
      
      {/* Deadlines section */}
      {sortedDeadlineTimers.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-red-500" />
            <h4 className="font-medium text-sm">Deadlines</h4>
          </div>
          <div className="space-y-2">
            {sortedDeadlineTimers.map((timer) => {
              const deadline = timer.deadline ? new Date(timer.deadline) : null;
              const isOverdue = deadline ? isPast(deadline) && !isToday(deadline) : false;
              const isTodayDate = deadline ? isToday(deadline) : false;
              
              return (
                <div 
                  key={timer.id}
                  className={cn(
                    "flex justify-between items-center p-2 rounded-md border",
                    isOverdue ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800" :
                    isTodayDate ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800" :
                    "bg-secondary/20 border-border/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-1.5 h-8 rounded-full",
                      timer.category === "Work" ? "bg-blue-500" :
                      timer.category === "Study" ? "bg-purple-500" :
                      timer.category === "Personal" ? "bg-green-500" :
                      timer.category === "Health" ? "bg-red-500" :
                      timer.category === "Leisure" ? "bg-amber-500" :
                      timer.category === "Project" ? "bg-indigo-500" :
                      timer.category === "Meeting" ? "bg-pink-500" :
                      "bg-gray-500"
                    )}></div>
                    <div>
                      <p className="font-medium text-sm">{timer.name}</p>
                      {timer.category && (
                        <Badge variant="outline" className="h-4 text-[0.6rem] border-border/50 mt-1">
                          {timer.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className={cn(
                    "text-xs font-mono font-medium px-2 py-1 rounded-md",
                    isOverdue ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" :
                    isTodayDate ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" :
                    "bg-secondary/40"
                  )}>
                    {deadline ? format(deadline, "HH:mm") : "No time"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Category filter */}
      <div className="mb-4">
        <CategoryFilter 
          categoryFilter={categoryFilter} 
          setCategoryFilter={setCategoryFilter}
          categories={categories}
        />
      </div>
      
      {/* Total time summary */}
      {selectedDate && (
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
      )}
      
      {/* Session count */}
      {selectedDate && filteredTimers.length > 0 && (
        <div className="mb-4 text-center">
          <Badge variant="outline" className="bg-primary/10 text-primary-foreground/90">
            {filteredTimers.length} {filteredTimers.length === 1 ? 'session' : 'sessions'} tracked
          </Badge>
        </div>
      )}
      
      {/* Timers list for selected day */}
      <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredTimers.length > 0 ? (
          <>
            {filteredTimers.map((timer) => (
              <div 
                key={timer.id} 
                className="flex justify-between items-center p-3 rounded-md bg-secondary/20 border border-border/50 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-10 rounded-full ${
                    timer.category === "Work" ? "bg-blue-500" :
                    timer.category === "Study" ? "bg-purple-500" :
                    timer.category === "Personal" ? "bg-green-500" :
                    timer.category === "Health" ? "bg-red-500" :
                    timer.category === "Leisure" ? "bg-amber-500" :
                    timer.category === "Project" ? "bg-indigo-500" :
                    timer.category === "Meeting" ? "bg-pink-500" :
                    "bg-gray-500"
                  }`}></div>
                  <div>
                    <p className="font-medium">{timer.name}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock size={12} className="mr-1" />
                      {format(new Date(timer.createdAt), "h:mm a")}
                      {timer.category && (
                        <Badge variant="outline" className="ml-2 h-5 text-[0.65rem] border-border/50">
                          {timer.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-mono font-medium bg-secondary/40 px-2 py-1 rounded-md">
                  {formatTime(timer.elapsedTime)}
                </div>
              </div>
            ))}
            
            {/* Total time */}
            <div className="flex justify-between items-center p-3 border-t border-border mt-4 pt-4 bg-secondary/10 rounded-md">
              <p className="font-medium">Total</p>
              <p className="font-bold font-mono bg-primary/10 text-primary px-2 py-1 rounded-md">
                {formatTime(totalTrackedTime)}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-muted-foreground border border-dashed border-border/50 rounded-lg bg-secondary/10">
            <p>No activity recorded for this day.</p>
            <p className="text-xs mt-1">Track time to see your activity here.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default DayView;
