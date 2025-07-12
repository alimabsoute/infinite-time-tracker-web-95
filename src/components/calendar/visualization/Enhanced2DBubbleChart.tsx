
import React from 'react';
import { Scatter } from 'recharts';
import { ResponsiveContainer, ScatterChart, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { TimerSessionWithTimer } from '../../../types';

interface Enhanced2DBubbleChartProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
}

const PASTEL_COLORS: { [key: string]: string } = {
  'Work': 'rgba(147, 197, 253, 0.7)',      // Light blue
  'Personal': 'rgba(167, 243, 208, 0.7)',   // Light green
  'Study': 'rgba(253, 224, 71, 0.7)',       // Light yellow
  'Exercise': 'rgba(252, 165, 165, 0.7)',   // Light red
  'Health': 'rgba(196, 181, 253, 0.7)',     // Light purple
  'Uncategorized': 'rgba(209, 213, 219, 0.7)', // Light gray
};

const Enhanced2DBubbleChart: React.FC<Enhanced2DBubbleChartProps> = ({ 
  sessions, 
  selectedCategory 
}) => {
  // Process sessions into bubble data
  const bubbleData = React.useMemo(() => {
    const filteredSessions = sessions.filter(session => 
      session.duration_ms && 
      session.timers &&
      (!selectedCategory || selectedCategory === 'all' || session.timers.category === selectedCategory)
    );

    // Group sessions by timer
    const timerGroups: { [key: string]: TimerSessionWithTimer[] } = {};
    filteredSessions.forEach(session => {
      const timerId = session.timer_id;
      if (!timerGroups[timerId]) {
        timerGroups[timerId] = [];
      }
      timerGroups[timerId].push(session);
    });

    // Calculate metrics for each timer
    const timerMetrics = Object.entries(timerGroups).map(([timerId, timerSessions]) => {
      const totalTime = timerSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
      const sessionCount = timerSessions.length;
      const avgSessionTime = totalTime / sessionCount;
      const timer = timerSessions[0].timers;
      
      return {
        timerId,
        name: timer?.name || 'Unknown Timer',
        category: timer?.category || 'Uncategorized',
        totalTimeHours: totalTime / (1000 * 60 * 60), // Convert to hours for X-axis
        avgSessionTimeMinutes: avgSessionTime / (1000 * 60), // Convert to minutes for Y-axis
        sessionCount,
        color: PASTEL_COLORS[timer?.category || 'Uncategorized'] || PASTEL_COLORS['Uncategorized']
      };
    });

    return timerMetrics;
  }, [sessions, selectedCategory]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-gray-600">Category: {data.category}</p>
          <p className="text-sm">Total Time: {data.totalTimeHours.toFixed(1)} hours</p>
          <p className="text-sm">Avg Session: {data.avgSessionTimeMinutes.toFixed(0)} minutes</p>
          <p className="text-sm">Sessions: {data.sessionCount}</p>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const radius = Math.max(4, Math.min(20, payload.sessionCount * 2)); // Size based on session count
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={payload.color}
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth={2}
        style={{ cursor: 'pointer' }}
      />
    );
  };

  if (bubbleData.length === 0) {
    return (
      <div className="h-[400px] w-full bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No timer data available</p>
          <p className="text-sm mt-2">Create timers and log sessions to see the bubble chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          data={bubbleData}
          margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number" 
            dataKey="totalTimeHours"
            name="Total Time (Hours)"
            tick={{ fontSize: 12 }}
            label={{ value: 'Total Time (Hours)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            type="number" 
            dataKey="avgSessionTimeMinutes"
            name="Avg Session (Minutes)"
            tick={{ fontSize: 12 }}
            label={{ value: 'Average Session Time (Minutes)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={bubbleData} shape={<CustomDot />} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Enhanced2DBubbleChart;
