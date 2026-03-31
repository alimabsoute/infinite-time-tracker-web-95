
import React, { useMemo } from 'react';
import { TimerSessionWithTimer } from '../../../types';
import { processBubbleData } from './BubbleDataProcessor';
import { BubbleChart } from './BubbleChart';

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
    <div className="h-[400px] w-full border rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 relative">
      <div className="h-full">
        <BubbleChart chartData={chartData} onBubbleClick={onBubbleClick} />
      </div>
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 text-xs border">
        <div className="font-semibold mb-2">2D Bubble Chart</div>
        <div>• X-axis: Total time (hours)</div>
        <div>• Y-axis: Avg session (minutes)</div>
        <div>• Size: Total time (30-300px)</div>
        <div className="text-muted-foreground mt-2">{chartData.length} timers</div>
      </div>
    </div>
  );
};

export default Enhanced2DBubbleChart;
