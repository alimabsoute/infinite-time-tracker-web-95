
import React from 'react';
import { TimerSessionWithTimer } from '../../../types';
import Robust3DContainer from './Robust3DContainer';
import { BubbleData } from './BubbleDataProcessor';
import { addDays } from 'date-fns';

interface Enhanced3DBubbleChartProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
  onBubbleClick?: (timer: any) => void;
  startDate?: Date;
  endDate?: Date;
}

const Enhanced3DBubbleChart: React.FC<Enhanced3DBubbleChartProps> = ({ 
  sessions, 
  selectedCategory,
  onBubbleClick,
  startDate,
  endDate
}) => {
  console.log('🔍 Enhanced3DBubbleChart - Using new robust architecture:', {
    totalSessions: sessions.length,
    selectedCategory,
    dateRange: startDate && endDate ? {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    } : 'Using current week'
  });

  // Default to current week if no dates provided
  const defaultStartDate = startDate || new Date();
  const defaultEndDate = endDate || addDays(defaultStartDate, 7);

  const handleBubbleClick = (bubble: BubbleData) => {
    console.log('🔍 Enhanced3DBubbleChart - Bubble clicked:', bubble.timerName);
    // Convert bubble data to timer format for backward compatibility
    const timerData = {
      id: bubble.timerId,
      name: bubble.timerName,
      category: bubble.category,
      totalTime: bubble.totalTime,
      sessionCount: bubble.sessionCount,
      isRunning: bubble.isRunning,
      sessions: bubble.sessions
    };
    onBubbleClick?.(timerData);
  };

  if (sessions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/10 rounded-lg">
        <div className="text-center text-muted-foreground space-y-2">
          <p className="font-medium">No data available</p>
          <p className="text-sm">Create timers and log time to see visualizations</p>
          <p className="text-xs">Sessions processed: {sessions.length}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full border rounded-lg overflow-hidden bg-gradient-to-br from-background to-muted/20 relative">
      <Robust3DContainer
        sessions={sessions}
        startDate={defaultStartDate}
        endDate={defaultEndDate}
        onBubbleClick={handleBubbleClick}
        selectedCategory={selectedCategory}
      />
    </div>
  );
};

export default Enhanced3DBubbleChart;
