
import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@shared/components/ui/button';
import { formatTime } from './CalendarUtils';

interface CalendarStatsProps {
  daysWithData: Array<{
    date: Date;
    totalTime: number;
    timers: number;
    inCurrentMonth: boolean;
  }>;
  mostActiveDay: {
    date: Date;
    totalTime: number;
    timers: number;
    inCurrentMonth: boolean;
  } | null;
  setSelectedDate: (date: Date | undefined) => void;
}

const CalendarStats: React.FC<CalendarStatsProps> = ({
  daysWithData,
  mostActiveDay,
  setSelectedDate,
}) => {
  return (
    <motion.div 
      className="mt-4 p-3 border border-border/30 rounded-lg bg-secondary/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <div className="grid grid-cols-3 gap-2 text-center">
        {daysWithData.filter(d => d.totalTime > 0).length > 0 ? (
          <>
            <motion.div whileHover={{ y: -2 }} className="p-2">
              <div className="text-xs text-muted-foreground">Active Days</div>
              <div className="text-xl font-medium">
                {daysWithData.filter(d => d.totalTime > 0).length}
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="p-2">
              <div className="text-xs text-muted-foreground">Avg Time/Day</div>
              <div className="text-xl font-medium">
                {formatTime(
                  daysWithData.reduce((sum, day) => sum + day.totalTime, 0) / 
                  Math.max(1, daysWithData.filter(d => d.totalTime > 0).length)
                )}
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="p-2">
              <div className="text-xs text-muted-foreground">Total Hours</div>
              <div className="text-xl font-medium">
                {Math.round(daysWithData.reduce((sum, day) => sum + day.totalTime, 0) / 36000) / 100}h
              </div>
            </motion.div>
            
            {/* Most active day highlights */}
            {mostActiveDay && mostActiveDay.totalTime > 0 && (
              <div className="col-span-3 mt-2 pt-2 border-t border-border/30">
                <div className="text-xs text-muted-foreground mb-1">Most Active Day</div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm font-medium"
                  onClick={() => setSelectedDate(mostActiveDay.date)}
                >
                  {format(mostActiveDay.date, 'MMM d')} - {formatTime(mostActiveDay.totalTime)}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="col-span-3 py-2 text-center text-muted-foreground text-sm">
            No activity recorded this month
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CalendarStats;
