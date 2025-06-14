
import React from 'react';
import { isSameDay } from 'date-fns';
import { motion } from 'framer-motion';

interface WeekData {
  date: Date;
  day: string;
  totalHours: number;
  timers: number;
}

interface WeeklyStatsProps {
  weekData: WeekData[];
  selectedDate: Date;
  formatTime: (ms: number) => string;
  onDayClick: (day: WeekData) => void;
}

const WeeklyStats: React.FC<WeeklyStatsProps> = ({
  weekData,
  selectedDate,
  formatTime,
  onDayClick
}) => {
  const totalTime = weekData.reduce((sum, day) => sum + day.totalHours * 3600000, 0);
  const averageTime = totalTime / 7;
  const activeDays = weekData.filter(day => day.totalHours > 0).length;

  return (
    <>
      {/* Day selection indicators */}
      <div className="flex justify-center mt-2 gap-1">
        {weekData.map((day, index) => (
          <motion.div 
            key={index}
            className={`h-1.5 rounded-full cursor-pointer ${
              selectedDate && isSameDay(day.date, selectedDate) 
                ? 'bg-primary w-6' 
                : 'bg-primary/30 w-4'
            }`}
            whileHover={{ scale: 1.2 }}
            onClick={() => onDayClick(day)}
          />
        ))}
      </div>
      
      {/* Interactive weekly summary */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <motion.div 
          className="p-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
          whileHover={{ y: -2 }}
        >
          <p className="text-xs text-muted-foreground">Total Time</p>
          <p className="font-medium">{formatTime(totalTime)}</p>
        </motion.div>
        <motion.div 
          className="p-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
          whileHover={{ y: -2 }}
        >
          <p className="text-xs text-muted-foreground">Daily Average</p>
          <p className="font-medium">{formatTime(averageTime)}</p>
        </motion.div>
        <motion.div 
          className="p-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
          whileHover={{ y: -2 }}
        >
          <p className="text-xs text-muted-foreground">Active Days</p>
          <p className="font-medium">{activeDays}</p>
        </motion.div>
      </div>
    </>
  );
};

export default WeeklyStats;
