
import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { BubbleDataPoint } from './BubbleDataProcessor';
import { BubbleTooltip } from './BubbleTooltip';
import { CustomBubbleDot } from './CustomBubbleDot';

interface BubbleChartProps {
  chartData: BubbleDataPoint[];
  onBubbleClick?: (data: any) => void;
}

export const BubbleChart: React.FC<BubbleChartProps> = ({ chartData, onBubbleClick }) => {
  const [activePoint, setActivePoint] = useState<string | null>(null);

  const handleDotClick = (data: any) => {
    if (data && data.payload) {
      onBubbleClick?.(data.payload);
    }
  };


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
          data={chartData}
          shape={(props: any) => (
            <CustomBubbleDot
              {...props}
              onClick={handleDotClick}
              onMouseEnter={setActivePoint}
              onMouseLeave={() => setActivePoint(null)}
              activePoint={activePoint}
            />
          )}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};
