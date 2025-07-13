
import React from 'react';
import { BubbleDataPoint } from './BubbleDataProcessor';

interface BubbleTooltipProps {
  active?: boolean;
  payload?: any[];
}

export const BubbleTooltip: React.FC<BubbleTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as BubbleDataPoint;
    return (
      <div className="bg-background/95 backdrop-blur-sm p-4 border border-border rounded-lg shadow-lg">
        <p className="font-semibold text-lg text-foreground">
          {data.name} {data.isRunning && <span className="text-green-500">(Running)</span>}
        </p>
        <p className="text-sm text-muted-foreground mb-2">{data.category}</p>
        <div className="space-y-1 text-sm">
          <p><span className="font-medium">Total Time:</span> {data.totalHours} hours</p>
          <p><span className="font-medium">Avg Session:</span> {data.avgMinutes} minutes</p>
          <p><span className="font-medium">Sessions:</span> {data.sessionCount}</p>
          <p><span className="font-medium">Bubble Size:</span> {data.size.toFixed(0)}px</p>
          {data.isRunning && (
            <p className="text-green-600 font-medium">Currently Active</p>
          )}
        </div>
      </div>
    );
  }
  return null;
};
