
import React, { useState, useMemo } from 'react';
import { TimerSessionWithTimer } from '../../../types';
import { getProcessedTimerColors } from '../../../utils/timerColorProcessor';
import SafeCanvas3D from './SafeCanvas3D';
import Enhanced3DScene from './Enhanced3DScene';
import Visualization3DErrorBoundary from './Visualization3DErrorBoundary';
import { BubbleData } from './BubbleDataProcessor';

interface Enhanced3DBubbleChartProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
  onBubbleClick?: (timer: any) => void;
}

const Enhanced3DBubbleChart: React.FC<Enhanced3DBubbleChartProps> = ({ 
  sessions, 
  selectedCategory,
  onBubbleClick 
}) => {
  const [autoRotate, setAutoRotate] = useState(false);
  const [showAxes, setShowAxes] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  const bubbleData = useMemo(() => {
    console.log('🔍 Enhanced3DBubbleChart - Processing sessions:', {
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

    if (filteredSessions.length === 0) return [];

    const timerGroups: { [key: string]: TimerSessionWithTimer[] } = {};
    filteredSessions.forEach(session => {
      const timerId = session.timer_id;
      if (!timerGroups[timerId]) {
        timerGroups[timerId] = [];
      }
      timerGroups[timerId].push(session);
    });

    const timerStats = Object.entries(timerGroups).map(([timerId, timerSessions]) => {
      const totalTime = timerSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
      const sessionCount = timerSessions.length;
      const avgSessionTime = totalTime / sessionCount;
      const timer = timerSessions[0].timers;
      const isRunning = timerSessions.some(s => s.id.startsWith('virtual-'));
      
      return {
        timerId,
        name: timer?.name || 'Unknown Timer',
        category: timer?.category || 'Uncategorized',
        totalTime,
        sessionCount,
        avgSessionTime,
        sessions: timerSessions,
        isRunning
      };
    });

    if (timerStats.length === 0) return [];

    const maxTotalTime = Math.max(...timerStats.map(t => t.totalTime));
    const maxSessionCount = Math.max(...timerStats.map(t => t.sessionCount));
    const maxAvgTime = Math.max(...timerStats.map(t => t.avgSessionTime));

    const bubbles: BubbleData[] = timerStats.map((timer, index) => {
      let colors;
      try {
        colors = getProcessedTimerColors(timer.timerId);
      } catch (error) {
        colors = { primaryBorder: `hsl(${Math.random() * 360}, 65%, 55%)` };
      }
      
      // Enhanced 3D positioning with better distribution
      const timeRatio = timer.totalTime / maxTotalTime;
      const sessionRatio = timer.sessionCount / maxSessionCount;
      const avgRatio = timer.avgSessionTime / maxAvgTime;
      
      const x = (timeRatio * 16) - 8; // -8 to 8 range
      const y = (avgRatio * 12) - 6;  // -6 to 6 range  
      const z = (sessionRatio * 8) - 4; // -4 to 4 range
      
      // Enhanced size calculation with better scaling
      const baseSize = Math.max(0.4, Math.min(2.5, Math.log(timer.sessionCount + 1) * 0.6 + 0.3));
      const timeBonus = Math.min(1, timer.totalTime / (1000 * 60 * 60 * 10)); // Up to 10 hours
      const finalSize = baseSize + (timeBonus * 0.8);
      
      const bubbleColor = timer.isRunning ? '#22c55e' : colors.primaryBorder;
      
      return {
        id: `${timer.timerId}-${index}`,
        position: [x, y, z] as [number, number, number],
        size: finalSize,
        color: bubbleColor,
        timerName: timer.name,
        totalTime: timer.totalTime,
        sessionCount: timer.sessionCount,
        creationDate: new Date(),
        category: timer.category,
        isRunning: timer.isRunning,
        timerId: timer.timerId,
        name: timer.name,
        totalHours: (timer.totalTime / (1000 * 60 * 60)).toFixed(1),
        avgMinutes: (timer.avgSessionTime / (1000 * 60)).toFixed(1),
        avgSessionTime: timer.avgSessionTime,
        sessions: timer.sessions,
        x: timer.totalTime / (1000 * 60 * 60),
        y: timer.avgSessionTime / (1000 * 60)
      };
    });

    return bubbles;
  }, [sessions, selectedCategory]);

  const fallbackContent = (
    <div className="h-full flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <p>3D visualization unavailable</p>
        <p className="text-sm mt-2">Sessions processed: {sessions.length}</p>
      </div>
    </div>
  );

  if (bubbleData.length === 0) {
    return fallbackContent;
  }

  return (
    <div className="h-full w-full border rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative">
      <Visualization3DErrorBoundary fallback={fallbackContent}>
        <SafeCanvas3D
          camera={{ position: [15, 10, 15], fov: 60 }}
          className="h-full w-full"
          fallback={fallbackContent}
          shadows
          gl={{ 
            antialias: true, 
            alpha: false,
            powerPreference: "high-performance" 
          }}
        >
          <Enhanced3DScene 
            bubbles={bubbleData}
            onBubbleClick={onBubbleClick}
            autoRotate={autoRotate}
            showAxes={showAxes}
            showGrid={showGrid}
          />
        </SafeCanvas3D>
      </Visualization3DErrorBoundary>
      
      {/* Enhanced control panel */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="flex flex-col gap-2 text-xs">
          <div className="font-semibold mb-1">3D Controls</div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
              className="w-3 h-3"
            />
            Auto Rotate
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAxes}
              onChange={(e) => setShowAxes(e.target.checked)}
              className="w-3 h-3"
            />
            Show Axes
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="w-3 h-3"
            />
            Show Grid
          </label>
        </div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-xs space-y-1">
          <div className="font-semibold mb-2">Enhanced 3D Bubble Chart</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Running ({bubbleData.filter(d => d.isRunning).length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Stopped ({bubbleData.filter(d => !d.isRunning).length})</span>
          </div>
          <div className="text-muted-foreground mt-2 text-xs">
            • Size = Sessions + Time<br/>
            • X = Total Time<br/>
            • Y = Avg Session<br/>
            • Z = Activity Distribution
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enhanced3DBubbleChart;
