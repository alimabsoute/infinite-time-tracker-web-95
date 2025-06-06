
import React from 'react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Timer } from "../../types";
import EmptyState from "../EmptyState";

interface TimersListProps {
  filteredTimers: Timer[];
  formatTime: (ms: number) => string;
  totalTrackedTime: number;
}

const TimersList: React.FC<TimersListProps> = ({
  filteredTimers,
  formatTime,
  totalTrackedTime
}) => {
  return (
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
        <div className="py-4">
          <EmptyState 
            type="calendar" 
            showCreateButton={false}
          />
        </div>
      )}
    </div>
  );
};

export default TimersList;
