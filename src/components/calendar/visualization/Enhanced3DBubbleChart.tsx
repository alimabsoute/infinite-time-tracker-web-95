
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
  const [renderMode, setRenderMode] = useState<'3d' | '2d'>('3d');

  console.log('🔍 Enhanced3DBubbleChart - Processing sessions:', {
    totalSessions: sessions.length,
    selectedCategory,
    renderMode
  });

  const bubbleData = useMemo(() => {
    console.log('🔍 Enhanced3DBubbleChart - Computing bubble data...');

    // Filter sessions with enhanced validation
    const filteredSessions = sessions.filter(session => {
      const hasDuration = session.duration_ms && session.duration_ms > 0;
      const hasTimer = session.timers?.name && session.timer_id;
      const matchesCategory = !selectedCategory || selectedCategory === 'all' || session.timers?.category === selectedCategory;
      
      return hasDuration && hasTimer && matchesCategory;
    });

    console.log('🔍 Enhanced3DBubbleChart - Filtered sessions:', filteredSessions.length);

    if (filteredSessions.length === 0) {
      console.log('❌ Enhanced3DBubbleChart - No valid sessions found');
      return [];
    }

    // Group by timer ID
    const timerGroups: { [key: string]: TimerSessionWithTimer[] } = {};
    filteredSessions.forEach(session => {
      const timerId = session.timer_id;
      if (!timerGroups[timerId]) {
        timerGroups[timerId] = [];
      }
      timerGroups[timerId].push(session);
    });

    console.log('🔍 Enhanced3DBubbleChart - Timer groups:', Object.keys(timerGroups).length);

    // Calculate timer statistics
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

    if (timerStats.length === 0) {
      console.log('❌ Enhanced3DBubbleChart - No timer stats generated');
      return [];
    }

    // Calculate scaling factors
    const maxTotalTime = Math.max(...timerStats.map(t => t.totalTime));
    const maxSessionCount = Math.max(...timerStats.map(t => t.sessionCount));
    const maxAvgTime = Math.max(...timerStats.map(t => t.avgSessionTime));

    console.log('🔍 Enhanced3DBubbleChart - Scaling factors:', {
      maxTotalTime: Math.round(maxTotalTime / (1000 * 60 * 60 * 100)) / 100, // hours
      maxSessionCount,
      maxAvgTime: Math.round(maxAvgTime / (1000 * 60 * 100)) / 100 // minutes
    });

    // Generate bubble data with safe positioning
    const bubbles: BubbleData[] = timerStats.map((timer, index) => {
      let colors;
      try {
        colors = getProcessedTimerColors(timer.timerId);
      } catch (error) {
        console.warn('🔍 Enhanced3DBubbleChart - Color processing failed for timer:', timer.timerId);
        colors = { primaryBorder: `hsl(${Math.random() * 360}, 65%, 55%)` };
      }
      
      // Safe positioning calculations
      const timeRatio = Math.min(1, timer.totalTime / maxTotalTime);
      const sessionRatio = Math.min(1, timer.sessionCount / maxSessionCount);
      const avgRatio = Math.min(1, timer.avgSessionTime / maxAvgTime);
      
      // Enhanced 3D positioning with bounds checking
      const x = Math.max(-8, Math.min(8, (timeRatio * 16) - 8));
      const y = Math.max(-6, Math.min(6, (avgRatio * 12) - 6));
      const z = Math.max(-4, Math.min(4, (sessionRatio * 8) - 4));
      
      // Safe size calculation
      const baseSize = Math.max(0.3, Math.min(2.0, Math.log(timer.sessionCount + 1) * 0.5 + 0.2));
      const timeBonus = Math.min(0.8, timer.totalTime / (1000 * 60 * 60 * 10)); // Up to 10 hours
      const finalSize = Math.max(0.3, Math.min(2.5, baseSize + timeBonus));
      
      const bubbleColor = timer.isRunning ? '#22c55e' : colors.primaryBorder;
      
      const bubble: BubbleData = {
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

      return bubble;
    });

    console.log('✅ Enhanced3DBubbleChart - Generated bubbles:', bubbles.length);
    return bubbles;
  }, [sessions, selectedCategory]);

  const handleVisualizationError = (error: Error) => {
    console.error('❌ Enhanced3DBubbleChart - Visualization error:', error);
    setRenderMode('2d');
  };

  const fallbackContent = (
    <div className="h-full flex items-center justify-center bg-muted/10 rounded-lg">
      <div className="text-center text-muted-foreground space-y-2">
        <p className="font-medium">3D visualization unavailable</p>
        <p className="text-sm">Switching to 2D mode...</p>
        <p className="text-xs">Sessions: {sessions.length} | Valid bubbles: {bubbleData.length}</p>
      </div>
    </div>
  );

  if (bubbleData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/10 rounded-lg">
        <div className="text-center text-muted-foreground space-y-2">
          <p className="font-medium">No data available</p>
          <p className="text-sm">Create timers and log time to see visualizations</p>
          <p className="text-xs">Sessions processed: {sessions.length}</p>
        </div>
      </div>
    );
  }

  if (renderMode === '2d') {
    return fallbackContent;
  }

  return (
    <div className="h-full w-full border rounded-lg overflow-hidden bg-gradient-to-br from-background to-muted/20 relative">
      <Visualization3DErrorBoundary 
        fallback={fallbackContent}
        onError={handleVisualizationError}
      >
        <SafeCanvas3D
          camera={{ position: [15, 10, 15], fov: 60 }}
          className="h-full w-full"
          fallback={fallbackContent}
          shadows={true}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: false
          }}
          onCreated={(state) => {
            console.log('✅ Enhanced3DBubbleChart - Canvas created successfully');
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
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
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
      
      {/* Enhanced legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
        <div className="text-xs space-y-1">
          <div className="font-semibold mb-2">3D Bubble Chart ({bubbleData.length} timers)</div>
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
