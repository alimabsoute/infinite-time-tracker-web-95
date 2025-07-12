
import React, { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TimerSessionWithTimer } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Enhanced2DBubbleChartProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
  onBubbleClick?: (bubble: any) => void;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'Work': '#3b82f6',
  'Personal': '#10b981',
  'Study': '#f59e0b',
  'Exercise': '#ef4444',
  'Health': '#8b5cf6',
  'Uncategorized': '#6b7280',
};

const Enhanced2DBubbleChart: React.FC<Enhanced2DBubbleChartProps> = ({ 
  sessions, 
  selectedCategory,
  onBubbleClick 
}) => {
  const [hoveredBubble, setHoveredBubble] = useState<any | null>(null);

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
    return Object.entries(timerGroups).map(([timerId, timerSessions]) => {
      const totalTime = timerSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
      const sessionCount = timerSessions.length;
      const avgSessionTime = totalTime / sessionCount;
      const timer = timerSessions[0].timers;
      
      return {
        id: timerId,
        x: totalTime / (1000 * 60 * 60), // Total hours
        y: avgSessionTime / (1000 * 60), // Avg session minutes  
        z: Math.max(10, sessionCount * 8), // Scale for bubble size
        name: timer?.name || 'Unknown Timer',
        category: timer?.category || 'Uncategorized',
        totalHours: (totalTime / (1000 * 60 * 60)).toFixed(1),
        avgMinutes: (avgSessionTime / (1000 * 60)).toFixed(1),
        sessionCount,
        color: CATEGORY_COLORS[timer?.category || 'Uncategorized'],
        // Additional data for click handler
        timerData: {
          id: timerId,
          name: timer?.name || 'Unknown Timer',
          category: timer?.category || 'Uncategorized',
          totalTime: totalTime,
          sessionCount: sessionCount,
          avgSessionTime: avgSessionTime,
          sessions: timerSessions
        }
      };
    });
  }, [sessions, selectedCategory]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-lg">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{data.category}</p>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Total Time:</span> {data.totalHours} hours</p>
            <p><span className="font-medium">Avg Session:</span> {data.avgMinutes} minutes</p>
            <p><span className="font-medium">Sessions:</span> {data.sessionCount}</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">Click to see details</p>
        </div>
      );
    }
    return null;
  };

  const handleScatterClick = (data: any) => {
    if (onBubbleClick && data && data.timerData) {
      console.log('🔍 Enhanced2DBubbleChart - Bubble clicked:', data.timerData);
      onBubbleClick(data.timerData);
    }
  };

  if (chartData.length === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No data available for 2D bubble chart</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle className="text-lg">Enhanced 2D Bubble Chart</CardTitle>
        <p className="text-sm text-muted-foreground">Interactive scatter plot with clickable bubbles</p>
      </CardHeader>
      <CardContent className="h-full">
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 60,
                left: 60,
              }}
              onClick={(event) => {
                if (event && event.activePayload && event.activePayload[0]) {
                  handleScatterClick(event.activePayload[0].payload);
                }
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
              <Scatter 
                data={chartData}
                style={{ cursor: 'pointer' }}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default Enhanced2DBubbleChart;
