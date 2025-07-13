
import React, { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TimerSessionWithTimer } from '../../../types';
import { getProcessedTimerColors } from '../../../utils/timerColorProcessor';

interface Enhanced2DBubbleChartProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
  onBubbleClick?: (timer: any) => void;
}

interface ChartDataPoint {
  x: number;
  y: number;
  z: number;
  timerId: string;
  name: string;
  category: string;
  totalHours: string;
  avgMinutes: string;
  sessionCount: number;
  color: string;
  sessions: TimerSessionWithTimer[];
}

const Enhanced2DBubbleChart: React.FC<Enhanced2DBubbleChartProps> = ({ 
  sessions, 
  selectedCategory,
  onBubbleClick 
}) => {
  const [activePoint, setActivePoint] = useState<string | null>(null);

  const chartData = useMemo(() => {
    const filteredSessions = sessions.filter(session => 
      session.duration_ms && 
      session.timers &&
      (!selectedCategory || selectedCategory === 'all' || session.timers.category === selectedCategory)
    );

    if (filteredSessions.length === 0) return [];

    const timerGroups: { [key: string]: TimerSessionWithTimer[] } = {};
    filteredSessions.forEach(session => {
      const timerId = session.timer_id;
      if (!timerGroups[timerId]) {
        timerGroups[timerId] = [];
      }
      timerGroups[timerId].push(session);
    });

    return Object.entries(timerGroups).map(([timerId, timerSessions]) => {
      const totalTime = timerSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
      const sessionCount = timerSessions.length;
      const avgSessionTime = totalTime / sessionCount;
      const timer = timerSessions[0].timers;
      
      const colors = getProcessedTimerColors(timerId);
      
      const dataPoint: ChartDataPoint = {
        x: totalTime / (1000 * 60 * 60), // Total hours
        y: avgSessionTime / (1000 * 60), // Avg session minutes
        z: Math.max(100, sessionCount * 20), // Bubble size
        timerId,
        name: timer?.name || 'Unknown Timer',
        category: timer?.category || 'Uncategorized',
        totalHours: (totalTime / (1000 * 60 * 60)).toFixed(1),
        avgMinutes: (avgSessionTime / (1000 * 60)).toFixed(1),
        sessionCount,
        color: colors.primaryBorder,
        sessions: timerSessions
      };
      
      return dataPoint;
    });
  }, [sessions, selectedCategory]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <div className="bg-background/95 backdrop-blur-sm p-4 border border-border rounded-lg shadow-lg">
          <p className="font-semibold text-lg text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground mb-2">{data.category}</p>
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

  const handleDotClick = (data: any) => {
    if (data && data.payload) {
      onBubbleClick?.(data.payload);
    }
  };

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No data available for 2D scatter visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full border rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="h-full">
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
            <Tooltip content={<CustomTooltip />} />
            <Scatter 
              data={chartData}
              onClick={handleDotClick}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  fillOpacity={activePoint === entry.timerId ? 0.9 : 0.7}
                  stroke={entry.color}
                  strokeWidth={2}
                  r={Math.sqrt(entry.z / Math.PI)}
                  onMouseEnter={() => setActivePoint(entry.timerId)}
                  onMouseLeave={() => setActivePoint(null)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Enhanced2DBubbleChart;
