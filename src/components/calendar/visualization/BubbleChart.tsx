
import React, { useState } from 'react';
import { ComposedChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { BubbleDataPoint } from './BubbleDataProcessor';
import { BubbleTooltip } from './BubbleTooltip';

interface BubbleChartProps {
  chartData: BubbleDataPoint[];
  onBubbleClick?: (data: any) => void;
}

export const BubbleChart: React.FC<BubbleChartProps> = ({ chartData, onBubbleClick }) => {
  const [activePoint, setActivePoint] = useState<string | null>(null);

  const handleDotClick = (data: any) => {
    if (data && data.payload) {
      console.log('🔍 BubbleChart - Bubble clicked:', data.payload.name);
      onBubbleClick?.(data.payload);
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        margin={{
          top: 20,
          right: 30,
          bottom: 60,
          left: 60,
        }}
        data={chartData}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          type="number" 
          dataKey="x" 
          name="Total Time"
          domain={['dataMin', 'dataMax']}
          label={{ 
            value: 'Total Time (hours)', 
            position: 'insideBottom', 
            offset: -20,
            style: { textAnchor: 'middle' }
          }}
          tickFormatter={(value) => `${value.toFixed(1)}h`}
        />
        <YAxis 
          type="number" 
          dataKey="y" 
          name="Avg Session Time"
          domain={['dataMin', 'dataMax']}
          label={{ 
            value: 'Avg Session (minutes)', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle' }
          }}
          tickFormatter={(value) => `${value.toFixed(0)}m`}
        />
        <Tooltip content={<BubbleTooltip />} />
        <Scatter 
          dataKey="size"
          onClick={handleDotClick}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color}
              fillOpacity={activePoint === entry.timerId ? 1.0 : 0.7}
              stroke={entry.isRunning ? 'rgba(34, 197, 94, 1)' : 'rgba(255, 255, 255, 0.8)'}
              strokeWidth={entry.isRunning ? 3 : 2}
              onMouseEnter={() => setActivePoint(entry.timerId)}
              onMouseLeave={() => setActivePoint(null)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </Scatter>
      </ComposedChart>
    </ResponsiveContainer>
  );
};
