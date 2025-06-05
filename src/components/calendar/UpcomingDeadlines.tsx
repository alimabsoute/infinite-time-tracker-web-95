
import React, { useMemo } from 'react';
import { format, isToday, isTomorrow, isThisWeek, isPast, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Calendar as CalendarIcon } from "lucide-react";
import { Timer } from "../../types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface UpcomingDeadlinesProps {
  timers: Timer[];
}

const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ timers }) => {
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const nextWeek = addDays(now, 7);
    
    // Get all timers with deadlines in the next week
    const deadlineTimers = timers.filter(timer => 
      timer.deadline && 
      new Date(timer.deadline) <= nextWeek
    );
    
    // Sort by deadline time
    return deadlineTimers.sort((a, b) => {
      if (!a.deadline || !b.deadline) return 0;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }, [timers]);
  
  const getDeadlineStatus = (deadline: Date) => {
    if (isPast(deadline) && !isToday(deadline)) {
      return { label: 'Overdue', variant: 'destructive' as const, icon: AlertTriangle };
    }
    if (isToday(deadline)) {
      return { label: 'Today', variant: 'default' as const, icon: Clock };
    }
    if (isTomorrow(deadline)) {
      return { label: 'Tomorrow', variant: 'secondary' as const, icon: Clock };
    }
    if (isThisWeek(deadline)) {
      return { label: 'This Week', variant: 'outline' as const, icon: CalendarIcon };
    }
    return { label: 'Upcoming', variant: 'outline' as const, icon: CalendarIcon };
  };
  
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
  
  if (upcomingDeadlines.length === 0) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="glass-effect border border-border/30 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingDeadlines.slice(0, 6).map((timer, index) => {
              const deadline = new Date(timer.deadline!);
              const status = getDeadlineStatus(deadline);
              const StatusIcon = status.icon;
              
              return (
                <motion.div
                  key={timer.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-200 hover:shadow-md",
                    status.variant === 'destructive' 
                      ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                      : status.variant === 'default'
                      ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                      : "bg-secondary/20 border-border/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-1 h-full rounded-full flex-shrink-0 mt-1",
                      getCategoryColor(timer.category)
                    )}></div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm truncate">{timer.name}</h4>
                        <Badge variant={status.variant} className="flex items-center gap-1 text-xs whitespace-nowrap">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{format(deadline, 'MMM d, yyyy • HH:mm')}</span>
                        </div>
                        
                        {timer.category && (
                          <Badge variant="outline" className="text-xs">
                            {timer.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {upcomingDeadlines.length > 6 && (
            <div className="mt-3 text-center">
              <Badge variant="secondary" className="text-xs">
                +{upcomingDeadlines.length - 6} more deadline{upcomingDeadlines.length - 6 > 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UpcomingDeadlines;
