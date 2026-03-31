
import React from 'react';
import { format, isPast, isToday } from 'date-fns';
import { Badge } from "@shared/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { Timer } from "../../types";
import { cn } from "@shared/lib/utils";

interface DeadlinesListProps {
  deadlineTimers: Timer[];
}

const DeadlinesList: React.FC<DeadlinesListProps> = ({ deadlineTimers }) => {
  if (deadlineTimers.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={14} className="text-red-500" />
        <h4 className="font-medium text-sm">Deadlines</h4>
      </div>
      <div className="space-y-2">
        {deadlineTimers.map((timer) => {
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
  );
};

export default DeadlinesList;
