
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer } from "../../types";
import { Clock, PlayCircle, Calendar, TimerIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

interface HorizontalTimerDisplayProps {
  timers: Timer[];
  formatTime: (ms: number) => string;
}

const HorizontalTimerDisplay: React.FC<HorizontalTimerDisplayProps> = ({
  timers,
  formatTime
}) => {
  console.log('HorizontalTimerDisplay - Received timers:', timers.length, timers);

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "Work": return "bg-blue-500";
      case "Study": return "bg-purple-500";
      case "Personal": return "bg-green-500";
      case "Health": return "bg-red-500";
      case "Leisure": return "bg-amber-500";
      case "Project": return "bg-indigo-500";
      case "Meeting": return "bg-pink-500";
      default: return "bg-gray-500";
    }
  };

  // Validate and filter timers data
  const validTimers = React.useMemo(() => {
    if (!Array.isArray(timers)) {
      console.warn('HorizontalTimerDisplay - Invalid timers data:', timers);
      return [];
    }
    
    return timers.filter(timer => 
      timer && 
      typeof timer === 'object' && 
      timer.id && 
      timer.name &&
      typeof timer.elapsedTime === 'number'
    );
  }, [timers]);

  console.log('HorizontalTimerDisplay - Valid timers:', validTimers.length, validTimers);

  if (validTimers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <PlayCircle className="h-12 w-12 opacity-50" />
            <TimerIcon className="h-6 w-6 absolute top-3 left-3 opacity-30" />
          </div>
          <div>
            <p className="text-sm font-medium">No timer sessions for this date</p>
            <p className="text-xs mt-1">Start a timer to see your activity here</p>
          </div>
        </div>
      </div>
    );
  }

  // Sort timers by creation time (most recent first)
  const sortedTimers = React.useMemo(() => {
    return [...validTimers].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [validTimers]);

  // Calculate total time for the day
  const totalTime = React.useMemo(() => {
    return sortedTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
  }, [sortedTimers]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Timer Sessions</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {sortedTimers.length} session{sortedTimers.length !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="outline" className="text-xs font-mono">
            Total: {formatTime(totalTime)}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {sortedTimers.map((timer, index) => (
          <motion.div
            key={`${timer.id}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="group hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Enhanced category indicator */}
                  <div 
                    className={cn(
                      "w-1.5 h-14 rounded-full flex-shrink-0 shadow-sm",
                      getCategoryColor(timer.category)
                    )}
                  />
                  
                  {/* Timer content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {timer.name}
                        </h4>
                        {timer.isRunning && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            Running
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                        <Clock className="h-3 w-3" />
                        <span className="font-mono font-medium">{formatTime(timer.elapsedTime)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {timer.category && (
                          <Badge variant="outline" className="text-xs">
                            {timer.category}
                          </Badge>
                        )}
                        
                        {timer.deadline && (
                          <Badge variant="secondary" className="text-xs">
                            Due: {format(new Date(timer.deadline), 'MMM d, HH:mm')}
                          </Badge>
                        )}
                        
                        {timer.priority && timer.priority <= 2 && (
                          <Badge variant="destructive" className="text-xs">
                            High Priority
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground flex-shrink-0">
                        {format(new Date(timer.createdAt), 'HH:mm')}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Summary footer */}
      {sortedTimers.length > 3 && (
        <div className="text-center pt-2 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            Showing {sortedTimers.length} timer sessions • Total time: {formatTime(totalTime)}
          </p>
        </div>
      )}
    </div>
  );
};

export default HorizontalTimerDisplay;
