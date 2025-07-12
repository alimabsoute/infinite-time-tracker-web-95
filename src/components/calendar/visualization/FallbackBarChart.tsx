
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TimerSessionWithTimer } from "../../../types";
import DataValidator from './DataValidator';

interface FallbackBarChartProps {
  sessions: TimerSessionWithTimer[];
  currentWeekStart: Date;
  onBubbleClick?: (bubble: any) => void;
}

const FallbackBarChart: React.FC<FallbackBarChartProps> = ({
  sessions,
  currentWeekStart,
  onBubbleClick
}) => {
  // Process data for bar chart
  const barData = useMemo(() => {
    console.log('🔍 FallbackBarChart - Processing data for bar chart');
    
    const validation = DataValidator.validateSessions(sessions, currentWeekStart);
    
    if (!validation.hasValidData) {
      return [];
    }

    const data = Object.entries(validation.timerGroups)
      .map(([timerName, group]) => ({
        name: timerName.length > 20 ? timerName.substring(0, 20) + '...' : timerName,
        fullName: timerName,
        hours: group.totalTime / 3600000,
        sessions: group.sessions.length,
        category: group.category
      }))
      .sort((a, b) => b.hours - a.hours) // Sort by hours descending
      .slice(0, 10); // Show top 10 timers

    console.log('🔍 FallbackBarChart - Generated bar data:', data.length);
    return data;
  }, [sessions, currentWeekStart]);

  const categoryColors: Record<string, string> = {
    'Work': '#3b82f6',
    'Personal': '#10b981',
    'Study': '#f59e0b',
    'Exercise': '#ef4444',
    'Health': '#8b5cf6',
    'Learning': '#06b6d4',
    'Uncategorized': '#6b7280'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.fullName}</p>
          <p className="text-sm text-muted-foreground">Category: {data.category}</p>
          <p className="text-sm">Time: {data.hours.toFixed(1)} hours</p>
          <p className="text-sm">Sessions: {data.sessions}</p>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any) => {
    if (data && onBubbleClick) {
      onBubbleClick({
        timerName: data.fullName,
        totalTime: data.hours * 3600000,
        sessionCount: data.sessions,
        category: data.category
      });
    }
  };

  if (!barData || barData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
        <div className="text-center">
          <p>No data available for bar chart</p>
          <p className="text-sm mt-2">Log some timer sessions to see the visualization</p>
          <p className="text-xs mt-4 text-slate-400">Sessions: {sessions.length}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-[400px] w-full bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4"
    >
      <div className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            onClick={handleBarClick}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]} cursor="pointer">
              {barData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={categoryColors[entry.category] || categoryColors.Uncategorized}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="font-semibold mb-2">Timer Activity Bar Chart</div>
        <div>• Height: Total hours logged</div>
        <div>• Colors: Categories</div>
        <div>• Top 10 most active timers</div>
        <div className="text-slate-600 mt-2">{barData.length} timers shown</div>
      </div>
    </motion.div>
  );
};

export default FallbackBarChart;
