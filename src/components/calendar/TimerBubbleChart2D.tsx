
import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TimerSessionWithTimer } from '../../types';

interface TimerBubbleChart2DProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'Work': '#3b82f6',
  'Personal': '#10b981',
  'Study': '#f59e0b',
  'Exercise': '#ef4444',
  'Health': '#8b5cf6',
  'Uncategorized': '#6b7280',
};

const TimerBubbleChart2D: React.FC<TimerBubbleChart2DProps> = ({ sessions, selectedCategory }) => {
  const chartData = useMemo(() => {
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
    return Object.entries(timerGroups).map(([_timerId, timerSessions]) => {
      const totalTime = timerSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
      const sessionCount = timerSessions.length;
      const avgSessionTime = totalTime / sessionCount;
      const timer = timerSessions[0].timers;
      
      return {
        x: totalTime / (1000 * 60 * 60), // Total hours
        y: avgSessionTime / (1000 * 60), // Avg session minutes  
        z: sessionCount * 5, // Scale for bubble size
        name: timer?.name || 'Unknown Timer',
        category: timer?.category || 'Uncategorized',
        totalHours: (totalTime / (1000 * 60 * 60)).toFixed(1),
        avgMinutes: (avgSessionTime / (1000 * 60)).toFixed(1),
        sessionCount,
        color: CATEGORY_COLORS[timer?.category || 'Uncategorized']
      };
    });
  }, [sessions, selectedCategory]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-lg">{data.name}</p>
          <p className="text-sm text-gray-600 mb-2">{data.category}</p>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Total Time:</span> {data.totalHours} hours</p>
            <p><span className="font-medium">Avg Session:</span> {data.avgMinutes} minutes</p>
            <p><span className="font-medium">Sessions:</span> {data.sessionCount}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 60,
            left: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Total Time"
            label={{ value: 'Total Time (hours)', position: 'insideBottom', offset: -10 }}
            tickFormatter={(value) => `${value.toFixed(1)}h`}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Avg Session Time"
            label={{ value: 'Avg Session (minutes)', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => `${value.toFixed(0)}m`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={chartData}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimerBubbleChart2D;
