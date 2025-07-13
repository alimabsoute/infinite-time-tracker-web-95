
import React from 'react';
import { motion } from 'framer-motion';
import { addDays } from 'date-fns';
import { TimerSessionWithTimer } from "../../types";
import Robust3DContainer from './visualization/Robust3DContainer';
import { BubbleData } from './visualization/BubbleDataProcessor';

interface BubbleChart3DProps {
  sessions: TimerSessionWithTimer[];
  currentWeekStart: Date;
  onBubbleClick?: (bubble: BubbleData) => void;
  selectedCategory?: string;
}

export const BubbleChart3D: React.FC<BubbleChart3DProps> = ({
  sessions,
  currentWeekStart,
  onBubbleClick,
  selectedCategory
}) => {
  // Calculate the week end date (7 days from start)
  const currentWeekEnd = addDays(currentWeekStart, 6);

  console.log('🔍 BubbleChart3D - Rendering with updated architecture:', {
    sessionsCount: sessions.length,
    weekRange: {
      start: currentWeekStart.toISOString(),
      end: currentWeekEnd.toISOString()
    },
    selectedCategory
  });

  const handleBubbleClick = (bubble: BubbleData) => {
    console.log('🔍 BubbleChart3D - Bubble clicked:', bubble.timerName);
    onBubbleClick?.(bubble);
  };

  if (!sessions || sessions.length === 0) {
    console.log('🔍 BubbleChart3D - No sessions available');
    return (
      <motion.div 
        className="h-[400px] w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-900/20 rounded-lg flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center text-foreground">
          <p className="font-medium">No timer sessions available</p>
          <p className="text-sm mt-2 text-muted-foreground">Create some timers and log time to see the 3D visualization</p>
          <p className="text-xs mt-4 text-muted-foreground">
            Week: {currentWeekStart.toLocaleDateString()} - {currentWeekEnd.toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <Robust3DContainer
      sessions={sessions}
      startDate={currentWeekStart}
      endDate={currentWeekEnd}
      onBubbleClick={handleBubbleClick}
      selectedCategory={selectedCategory}
    />
  );
};

export default BubbleChart3D;
