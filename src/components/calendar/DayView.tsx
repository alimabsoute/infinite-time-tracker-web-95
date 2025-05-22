
import React from 'react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { Timer } from "../../types";
import CategoryFilter from './CategoryFilter';

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
  return (
    <>
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
        <div className="bg-secondary/30 p-3 rounded-md mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Total tracked time:</span>
            <span className="font-mono font-bold">
              {formatTime(filteredTimers.reduce((sum, t) => sum + t.elapsedTime, 0))}
            </span>
          </div>
          <Progress 
            className="h-2 mt-2" 
            value={Math.min(
              (filteredTimers.reduce((sum, t) => sum + t.elapsedTime, 0) / (8 * 3600000)) * 100, 
              100
            )} 
          />
        </div>
      )}
      
      {/* Session count */}
      {selectedDate && filteredTimers.length > 0 && (
        <div className="mb-4 text-center">
          <Badge variant="outline" className="bg-primary/10">
            {filteredTimers.length} {filteredTimers.length === 1 ? 'session' : 'sessions'} tracked
          </Badge>
        </div>
      )}
      
      {/* Timers list for selected day */}
      <div className="space-y-3 mt-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
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
                        <Badge variant="outline" className="ml-2 h-5 text-[0.65rem]">
                          {timer.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-mono font-medium">{formatTime(timer.elapsedTime)}</div>
              </div>
            ))}
            
            {/* Total time */}
            <div className="flex justify-between items-center p-2 border-t border-border mt-4 pt-4">
              <p className="font-medium">Total</p>
              <p className="font-bold font-mono">
                {formatTime(filteredTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0))}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No activity recorded for this day.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default DayView;
