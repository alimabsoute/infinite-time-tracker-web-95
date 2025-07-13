
import React, { useMemo } from 'react';
import { TimerSessionWithTimer } from '../../../types';
import { processBubbleData } from './BubbleDataProcessor';
import { BubbleChart } from './BubbleChart';
import { BubbleLegend } from './BubbleLegend';

interface Enhanced2DBubbleChartProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
  onBubbleClick?: (timer: any) => void;
}

const Enhanced2DBubbleChart: React.FC<Enhanced2DBubbleChartProps> = ({ 
  sessions, 
  selectedCategory,
  onBubbleClick 
}) => {
  const chartData = useMemo(() => {
    return processBubbleData(sessions, selectedCategory);
  }, [sessions, selectedCategory]);

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No data available for 2D bubble visualization</p>
          <p className="text-sm mt-2">Sessions processed: {sessions.length}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full border rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 relative">
      <div className="h-full">
        <BubbleChart chartData={chartData} onBubbleClick={onBubbleClick} />
      </div>
      <BubbleLegend chartData={chartData} />
    </div>
  );
};

export default Enhanced2DBubbleChart;
