
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Scatter, ScatterChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { differenceInDays } from 'date-fns';
import { TimerSessionWithTimer } from "../../../types";
import DataValidator from './DataValidator';

interface Fallback2DChartProps {
  sessions: TimerSessionWithTimer[];
  currentWeekStart: Date;
  onBubbleClick?: (bubble: any) => void;
  onError?: (error: Error) => void;
}

const Fallback2DChart: React.FC<Fallback2DChartProps> = ({
  sessions,
  currentWeekStart,
  onBubbleClick,
  onError
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  // Process data for 2D scatter plot
  const scatterData = useMemo(() => {
    try {
      console.log('🔍 Fallback2DChart - Processing data for 2D visualization');
      
      const validation = DataValidator.validateSessions(sessions, currentWeekStart);
      
      if (!validation.hasValidData) {
        return [];
      }

      const data = Object.entries(validation.timerGroups).map(([timerName, group]) => {
        const daysFromWeekStart = differenceInDays(group.createdAt, currentWeekStart);
        const timeInHours = group.totalTime / 3600000;
        
        // Category-based colors
        const colors: Record<string, string> = {
          'Work': '#3b82f6',
          'Personal': '#10b981',
          'Study': '#f59e0b',
          'Exercise': '#ef4444',
          'Health': '#8b5cf6',
          'Learning': '#06b6d4',
          'Uncategorized': '#6b7280'
        };
        
        return {
          x: Math.max(-3, Math.min(10, daysFromWeekStart)), // Days from week start
          y: timeInHours, // Hours logged
          z: Math.max(20, Math.min(200, timeInHours * 50)), // Bubble size
          timerName,
          totalTime: group.totalTime,
          sessionCount: group.sessions.length,
          category: group.category,
          color: colors[group.category] || colors.Uncategorized
        };
      });

      console.log('🔍 Fallback2DChart - Generated scatter data:', data.length);
      return data;
    } catch (error) {
      console.error('🔍 Fallback2DChart - Data processing error:', error);
      onError?.(error as Error);
      return [];
    }
  }, [sessions, currentWeekStart, onError]);

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
              name="Days from Week Start"
              domain={[-3, 10]}
              label={{ value: 'Days from Week Start', position: 'insideBottom', offset: -40 }}
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
        <div>• X-axis: Days from week start</div>
        <div>• Y-axis: Hours logged</div>
        <div>• Size: Activity level</div>
        <div className="text-slate-600 mt-2">{scatterData.length} timers</div>
      </div>
    </motion.div>
  );
};

export default Fallback2DChart;
