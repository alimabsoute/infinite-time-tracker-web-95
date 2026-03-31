import React, { useMemo, useState } from 'react';
import { format, addDays, isThisWeek, isPast, isToday, isTomorrow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Timer } from '../../types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DetailedDeadlinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  timers: Timer[];
  initialFilter?: 'thisWeek' | 'nextWeek' | 'all';
}

type FilterType = 'all' | 'thisWeek' | 'nextWeek' | 'overdue' | 'today';

const DetailedDeadlinesModal: React.FC<DetailedDeadlinesModalProps> = ({
  isOpen,
  onClose,
  timers,
  initialFilter = 'all'
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>(initialFilter);

  const { filteredDeadlines, deadlineStats } = useMemo(() => {
    const now = new Date();
    const thisWeekEnd = addDays(now, 7);
    const nextWeekEnd = addDays(now, 14);

    const allDeadlines = timers.filter(timer => timer.deadline);
    
    const thisWeekDeadlines = allDeadlines.filter(timer => 
      new Date(timer.deadline!) <= thisWeekEnd
    );
    
    const nextWeekDeadlines = allDeadlines.filter(timer => 
      new Date(timer.deadline!) > thisWeekEnd &&
      new Date(timer.deadline!) <= nextWeekEnd
    );

    const overdueDeadlines = allDeadlines.filter(timer => 
      isPast(new Date(timer.deadline!)) && !isToday(new Date(timer.deadline!))
    );

    const todayDeadlines = allDeadlines.filter(timer => 
      isToday(new Date(timer.deadline!))
    );

    let filtered: Timer[] = [];
    switch (activeFilter) {
      case 'thisWeek':
        filtered = thisWeekDeadlines;
        break;
      case 'nextWeek':
        filtered = nextWeekDeadlines;
        break;
      case 'overdue':
        filtered = overdueDeadlines;
        break;
      case 'today':
        filtered = todayDeadlines;
        break;
      default:
        filtered = allDeadlines;
    }

    // Sort by deadline
    filtered.sort((a, b) => {
      if (!a.deadline || !b.deadline) return 0;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    return {
      filteredDeadlines: filtered,
      deadlineStats: {
        all: allDeadlines.length,
        thisWeek: thisWeekDeadlines.length,
        nextWeek: nextWeekDeadlines.length,
        overdue: overdueDeadlines.length,
        today: todayDeadlines.length
      }
    };
  }, [timers, activeFilter]);

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

  const FilterButton = ({ 
    filter, 
    label, 
    count 
  }: { 
    filter: FilterType; 
    label: string; 
    count: number;
  }) => (
    <Button
      variant={activeFilter === filter ? "default" : "outline"}
      size="sm"
      onClick={() => setActiveFilter(filter)}
      className="flex items-center gap-2"
    >
      {label}
      <Badge variant="secondary" className="ml-1 text-xs">
        {count}
      </Badge>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Detailed Deadlines Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <FilterButton filter="all" label="All" count={deadlineStats.all} />
            <FilterButton filter="overdue" label="Overdue" count={deadlineStats.overdue} />
            <FilterButton filter="today" label="Today" count={deadlineStats.today} />
            <FilterButton filter="thisWeek" label="This Week" count={deadlineStats.thisWeek} />
            <FilterButton filter="nextWeek" label="Next Week" count={deadlineStats.nextWeek} />
          </div>

          {/* Deadlines List */}
          <div className="overflow-y-auto max-h-[60vh] pr-2">
            {filteredDeadlines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No deadlines found for this filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredDeadlines.map((timer, index) => {
                  const deadline = new Date(timer.deadline!);
                  const status = getDeadlineStatus(deadline);
                  const StatusIcon = status.icon;
                  
                  return (
                    <motion.div
                      key={timer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={cn(
                        "p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer",
                        status.variant === 'destructive' 
                          ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                          : status.variant === 'default'
                          ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                          : "bg-secondary/20 border-border/50 hover:bg-secondary/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-1 h-full rounded-full flex-shrink-0 mt-1",
                          getCategoryColor(timer.category)
                        )}></div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h4 className="font-semibold text-base">{timer.name}</h4>
                            <Badge variant={status.variant} className="flex items-center gap-1 text-xs">
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{format(deadline, 'EEEE, MMM d, yyyy • HH:mm')}</span>
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
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailedDeadlinesModal;