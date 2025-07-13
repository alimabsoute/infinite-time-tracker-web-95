
import React, { useMemo, useState } from 'react';
import { ComposedChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TimerSessionWithTimer } from '../../../types';

interface Enhanced2DBubbleChartProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
  onBubbleClick?: (timer: any) => void;
}

interface BubbleDataPoint {
  x: number;
  y: number;
  size: number;
  timerId: string;
  name: string;
  category: string;
  totalHours: string;
  avgMinutes: string;
  sessionCount: number;
  color: string;
  sessions: TimerSessionWithTimer[];
  isRunning: boolean;
}

// Light pastel colors with transparency
const PASTEL_COLORS = [
  'rgba(255, 182, 193, 0.7)', // Light Pink
  'rgba(173, 216, 230, 0.7)', // Light Blue
  'rgba(144, 238, 144, 0.7)', // Light Green
  'rgba(255, 218, 185, 0.7)', // Peach
  'rgba(221, 160, 221, 0.7)', // Plum
  'rgba(255, 255, 224, 0.7)', // Light Yellow
  'rgba(175, 238, 238, 0.7)', // Pale Turquoise
  'rgba(255, 192, 203, 0.7)', // Pink
  'rgba(230, 230, 250, 0.7)', // Lavender
  'rgba(255, 228, 225, 0.7)', // Misty Rose
  'rgba(240, 248, 255, 0.7)', // Alice Blue
  'rgba(250, 240, 230, 0.7)', // Linen
];

const Enhanced2DBubbleChart: React.FC<Enhanced2DBubbleChartProps> = ({ 
  sessions, 
  selectedCategory,
  onBubbleClick 
}) => {
  const [activePoint, setActivePoint] = useState<string | null>(null);

  const chartData = useMemo(() => {
    console.log('🔍 Enhanced2DBubbleChart - Processing sessions:', {
      totalSessions: sessions.length,
      selectedCategory
    });
    
    // Filter sessions with proper validation
    const filteredSessions = sessions.filter(session => {
      const hasDuration = session.duration_ms && session.duration_ms > 0;
      const hasTimer = session.timers && session.timer_id && session.timers.name;
      const matchesCategory = !selectedCategory || selectedCategory === 'all' || session.timers?.category === selectedCategory;
      
      return hasDuration && hasTimer && matchesCategory;
    });

    if (filteredSessions.length === 0) {
      return [];
    }

    // Group sessions by timer
    const timerGroups: { [key: string]: TimerSessionWithTimer[] } = {};
    filteredSessions.forEach(session => {
      const timerId = session.timer_id;
      if (!timerGroups[timerId]) {
        timerGroups[timerId] = [];
      }
      timerGroups[timerId].push(session);
    });

    const bubbleData = Object.entries(timerGroups).map(([timerId, timerSessions], index) => {
      const totalTime = timerSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
      const sessionCount = timerSessions.length;
      const avgSessionTime = totalTime / sessionCount;
      const timer = timerSessions[0].timers;
      
      // Check if any session is a running timer (virtual session)
      const isRunning = timerSessions.some(s => s.id.startsWith('virtual-'));
      
      // Calculate bubble size - DRAMATICALLY increased scaling
      const hoursLogged = totalTime / (1000 * 60 * 60);
      // Minimum size 500, maximum size 8000, much more aggressive scaling
      const bubbleSize = Math.max(500, Math.min(8000, hoursLogged * 1200 + sessionCount * 200));
      
      // Use light pastel colors with transparency
      let color = PASTEL_COLORS[index % PASTEL_COLORS.length];
      
      // Special color for running timers - bright green with transparency
      if (isRunning) {
        color = 'rgba(34, 197, 94, 0.8)'; // Bright green with transparency
      }
      
      const dataPoint: BubbleDataPoint = {
        x: totalTime / (1000 * 60 * 60), // Total hours
        y: avgSessionTime / (1000 * 60), // Avg session minutes
        size: bubbleSize, // MUCH larger size range (500-8000)
        timerId,
        name: timer?.name || 'Unknown Timer',
        category: timer?.category || 'Uncategorized',
        totalHours: (totalTime / (1000 * 60 * 60)).toFixed(1),
        avgMinutes: (avgSessionTime / (1000 * 60)).toFixed(1),
        sessionCount,
        color,
        sessions: timerSessions,
        isRunning
      };
      
      console.log('🔍 Enhanced2DBubbleChart - Created bubble with LARGE size:', {
        name: dataPoint.name,
        totalHours: dataPoint.totalHours,
        sessionCount: dataPoint.sessionCount,
        bubbleSize: dataPoint.size,
        isRunning: dataPoint.isRunning,
        color: dataPoint.color
      });
      
      return dataPoint;
    });

    return bubbleData;
  }, [sessions, selectedCategory]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as BubbleDataPoint;
      return (
        <div className="bg-background/95 backdrop-blur-sm p-4 border border-border rounded-lg shadow-lg">
          <p className="font-semibold text-lg text-foreground">
            {data.name} {data.isRunning && <span className="text-green-500">(Running)</span>}
          </p>
          <p className="text-sm text-muted-foreground mb-2">{data.category}</p>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Total Time:</span> {data.totalHours} hours</p>
            <p><span className="font-medium">Avg Session:</span> {data.avgMinutes} minutes</p>
            <p><span className="font-medium">Sessions:</span> {data.sessionCount}</p>
            <p><span className="font-medium">Bubble Size:</span> {data.size.toFixed(0)}px</p>
            {data.isRunning && (
              <p className="text-green-600 font-medium">Currently Active</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleDotClick = (data: any) => {
    if (data && data.payload) {
      console.log('🔍 Enhanced2DBubbleChart - Bubble clicked:', data.payload.name);
      onBubbleClick?.(data.payload);
    }
  };

  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No data available for 2D bubble visualization</p>
          <p className="text-sm mt-2">Sessions processed: {sessions.length}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full border rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 relative">
      <div className="h-full">
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
            <Tooltip content={<CustomTooltip />} />
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
      </div>
      
      {/* Enhanced Legend */}
      <div className="absolute bottom-6 right-6 bg-background/90 backdrop-blur-sm rounded-lg p-3 text-xs shadow-lg">
        <div className="font-semibold mb-2">2D Bubble Chart - LARGE Bubbles</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500/70"></div>
            <span>Running ({chartData.filter(d => d.isRunning).length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: PASTEL_COLORS[0] }}></div>
            <span>Stopped ({chartData.filter(d => !d.isRunning).length})</span>
          </div>
          <div className="mt-2 pt-2 border-t border-border/50">
            <div>• Size = Total time (500-8000px)</div>
            <div>• Colors = Light pastels</div>
            <div>• Position = Time vs Sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enhanced2DBubbleChart;
