
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Scatter, ScatterChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { differenceInDays } from 'date-fns';
import { TimerSessionWithTimer } from "../../../types";
import { useDateRangeDataProcessor } from './DateRangeDataProcessor';

interface Fallback2DChartProps {
  sessions: TimerSessionWithTimer[];
  startDate: Date;
  endDate: Date;
  onBubbleClick?: (bubble: any) => void;
  onError?: (error: Error) => void;
}

const Fallback2DChart: React.FC<Fallback2DChartProps> = ({
  sessions,
  startDate,
  endDate,
  onBubbleClick,
  onError
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  // Use the date range data processor
  const processedData = useDateRangeDataProcessor({
    sessions,
    startDate,
    endDate,
    onError
  });

  // Convert processed data to scatter format
  const scatterData = useMemo(() => {
    try {
      
      if (!processedData || processedData.length === 0) {
        return [];
      }

      const data = processedData.map((item) => {
        const totalDays = differenceInDays(endDate, startDate) || 1;
        const daysFromStart = differenceInDays(item.creationDate, startDate);
        const xPosition = Math.max(-3, Math.min(10, (daysFromStart / totalDays) * 13 - 3));
        const timeInHours = item.totalTime / 3600000;
        
        return {
          x: xPosition,
          y: timeInHours,
          z: Math.max(20, Math.min(200, timeInHours * 50)),
          timerName: item.timerName,
          totalTime: item.totalTime,
          sessionCount: item.sessionCount,
          category: item.category,
          color: item.color
        };
      });

      return data;
    } catch (error) {
      console.error('Fallback2DChart - Data conversion error:', error);
      onError?.(error as Error);
      return [];
    }
  }, [processedData, startDate, endDate, onError]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.timerName}</p>
          <p className="text-sm text-muted-foreground">Category: {data.category}</p>
          <p className="text-sm">Time: {(data.y).toFixed(1)} hours</p>
          <p className="text-sm">Sessions: {data.sessionCount}</p>
        </div>
      );
    }
    return null;
  };

  const handleScatterClick = (data: any) => {
    if (data && onBubbleClick) {
      onBubbleClick({
        timerName: data.timerName,
        totalTime: data.totalTime,
        sessionCount: data.sessionCount,
        category: data.category
      });
    }
  };

  if (!scatterData || scatterData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
        <div className="text-center">
          <p>No data available for 2D scatter plot</p>
          <p className="text-sm mt-2">Log some timer sessions to see the visualization</p>
          <p className="text-xs mt-4 text-slate-400">Sessions: {sessions.length}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="h-[400px] w-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4"
    >
      <div className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
            onClick={handleScatterClick}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Days from Start"
              domain={[-3, 10]}
              label={{ value: 'Days from Start', position: 'insideBottom', offset: -40 }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Hours Logged"
              label={{ value: 'Hours Logged', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter 
              data={scatterData} 
              fill="#8884d8"
            >
              {scatterData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  r={Math.max(4, Math.min(20, entry.z / 10))}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="font-semibold mb-2">2D Scatter Plot</div>
        <div>• X-axis: Days from start</div>
        <div>• Y-axis: Hours logged</div>
        <div>• Size: Activity level</div>
        <div className="text-slate-600 mt-2">{scatterData.length} timers</div>
      </div>
    </motion.div>
  );
};

export default Fallback2DChart;
