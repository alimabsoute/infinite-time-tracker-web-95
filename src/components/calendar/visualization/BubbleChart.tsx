
import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
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

  console.log('🔍 BubbleChart - Data received:', {
    bubbleCount: chartData.length,
    sampleBubble: chartData[0] ? {
      name: chartData[0].name,
      x: chartData[0].x,
      y: chartData[0].y,
      z: chartData[0].z,
      size: chartData[0].size,
      color: chartData[0].color
    } : 'no data',
    zRange: chartData.length > 0 ? {
      min: Math.min(...chartData.map(d => d.z)),
      max: Math.max(...chartData.map(d => d.z))
    } : 'no range'
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
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
          dataKey="z"
          fill="transparent"
          onClick={handleDotClick}
          onMouseEnter={(data: any) => {
            if (data && data.payload) {
              setActivePoint(data.payload.timerId);
            }
          }}
          onMouseLeave={() => setActivePoint(null)}
          style={{ cursor: 'pointer' }}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};
