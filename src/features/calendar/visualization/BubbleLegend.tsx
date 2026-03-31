
import React from 'react';
import { BubbleDataPoint } from './BubbleDataProcessor';

interface BubbleLegendProps {
  chartData: BubbleDataPoint[];
}

export const BubbleLegend: React.FC<BubbleLegendProps> = ({ chartData }) => {
  return (
    <div className="absolute bottom-6 right-6 bg-background/90 backdrop-blur-sm rounded-lg p-3 text-xs shadow-lg">
      <div className="font-semibold mb-2">2D Bubble Chart - LARGE Bubbles</div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500/70"></div>
          <span>Running ({chartData.filter(d => d.isRunning).length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'rgba(255, 182, 193, 0.7)' }}></div>
          <span>Stopped ({chartData.filter(d => !d.isRunning).length})</span>
        </div>
        <div className="mt-2 pt-2 border-t border-border/50">
          <div>• Size = Total time (500-8000px)</div>
          <div>• Colors = Light pastels</div>
          <div>• Position = Time vs Sessions</div>
        </div>
      </div>
    </div>
  );
};
