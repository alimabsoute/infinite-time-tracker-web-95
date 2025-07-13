
import React, { useState, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { TimerSessionWithTimer } from '../../../types';
import { getProcessedTimerColors } from '../../../utils/timerColorProcessor';
import AxisSystem from './AxisSystem';

interface Enhanced3DBubbleChartProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
  onBubbleClick?: (timer: any) => void;
}

interface BubbleData {
  position: [number, number, number];
  size: number;
  color: string;
  timerId: string;
  name: string;
  category: string;
  totalTime: number;
  sessionCount: number;
  avgSessionTime: number;
  sessions: TimerSessionWithTimer[];
  isRunning: boolean;
}

const Bubble = ({ bubble, onClick, isHovered, onHover }: { 
  bubble: BubbleData; 
  onClick: (bubble: BubbleData) => void;
  isHovered: boolean;
  onHover: (timerId: string | null) => void;
}) => {
  return (
    <group position={bubble.position}>
      <mesh
        onClick={() => onClick(bubble)}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(bubble.timerId);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[bubble.size, 32, 32]} />
        <meshPhongMaterial 
          color={bubble.color} 
          transparent 
          opacity={isHovered ? 0.9 : 0.8}
          shininess={bubble.isRunning ? 150 : 100}
          emissive={bubble.isRunning ? bubble.color : '#000000'}
          emissiveIntensity={bubble.isRunning ? 0.1 : 0}
        />
      </mesh>
      
      {isHovered && (
        <Html center>
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 text-xs min-w-32 pointer-events-none shadow-lg">
            <div className="font-semibold text-foreground">
              {bubble.name} {bubble.isRunning && <span className="text-green-500">(Running)</span>}
            </div>
            <div className="text-muted-foreground">{bubble.category}</div>
            <div className="mt-2 space-y-1">
              <div>{bubble.sessionCount} sessions</div>
              <div>{(bubble.totalTime / (1000 * 60 * 60)).toFixed(1)}h total</div>
              <div>{(bubble.avgSessionTime / (1000 * 60)).toFixed(0)}m avg</div>
              {bubble.isRunning && (
                <div className="text-green-600 font-medium">Currently Active</div>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

const Enhanced3DBubbleChart: React.FC<Enhanced3DBubbleChartProps> = ({ 
  sessions, 
  selectedCategory,
  onBubbleClick 
}) => {
  const [hoveredTimer, setHoveredTimer] = useState<string | null>(null);
  const [canvasError, setCanvasError] = useState<string | null>(null);

  const bubbleData = useMemo(() => {
    console.log('🔍 Enhanced3DBubbleChart - Processing sessions:', {
      totalSessions: sessions.length,
      selectedCategory,
      sampleSessions: sessions.slice(0, 3).map(s => ({
        id: s.id,
        timer_id: s.timer_id,
        duration_ms: s.duration_ms,
        timer_name: s.timers?.name,
        isVirtual: s.id.startsWith('virtual-')
      }))
    });

    // More inclusive filtering - accept sessions with any positive duration
    const filteredSessions = sessions.filter(session => {
      const hasDuration = session.duration_ms && session.duration_ms > 0;
      const hasTimer = session.timers && session.timer_id && session.timers.name;
      const matchesCategory = !selectedCategory || selectedCategory === 'all' || session.timers?.category === selectedCategory;
      
      return hasDuration && hasTimer && matchesCategory;
    });

    console.log('🔍 Enhanced3DBubbleChart - After filtering:', {
      originalCount: sessions.length,
      filteredCount: filteredSessions.length
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
      
      // Check if any session is a running timer (virtual session)
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

    // Calculate ranges for proper 3D positioning
    const maxTotalTime = Math.max(...timerStats.map(t => t.totalTime));
    const maxSessionCount = Math.max(...timerStats.map(t => t.sessionCount));
    const maxAvgTime = Math.max(...timerStats.map(t => t.avgSessionTime));

    const bubbles: BubbleData[] = timerStats.map((timer) => {
      let colors;
      try {
        colors = getProcessedTimerColors(timer.timerId);
      } catch (error) {
        console.warn('🔍 Enhanced3DBubbleChart - Color processing failed:', error);
        colors = { primaryBorder: `hsl(${Math.random() * 360}, 65%, 55%)` };
      }
      
      // Proper 3D positioning based on metrics
      const x = ((timer.totalTime / maxTotalTime) * 10) - 5; // Total time on X-axis (-5 to 5)
      const y = ((timer.avgSessionTime / maxAvgTime) * 6) - 3; // Avg session time on Y-axis (-3 to 3)
      const z = ((timer.sessionCount / maxSessionCount) * 6) - 3; // Session count on Z-axis (-3 to 3)
      
      const bubbleColor = timer.isRunning ? `hsl(120, 70%, 50%)` : colors.primaryBorder;
      
      console.log('🔍 Enhanced3DBubbleChart - Created bubble:', {
        timerId: timer.timerId,
        name: timer.name,
        isRunning: timer.isRunning,
        position: [x, y, z],
        color: bubbleColor
      });
      
      return {
        position: [x, y, z] as [number, number, number],
        size: Math.max(0.3, Math.min(1.2, Math.log(timer.sessionCount + 1) * 0.4)),
        color: bubbleColor,
        timerId: timer.timerId,
        name: timer.name,
        category: timer.category,
        totalTime: timer.totalTime,
        sessionCount: timer.sessionCount,
        avgSessionTime: timer.avgSessionTime,
        sessions: timer.sessions,
        isRunning: timer.isRunning
      };
    });

    console.log('🔍 Enhanced3DBubbleChart - Generated bubbles:', {
      total: bubbles.length,
      running: bubbles.filter(b => b.isRunning).length,
      stopped: bubbles.filter(b => !b.isRunning).length
    });

    return bubbles;
  }, [sessions, selectedCategory]);

  const handleCanvasError = (error: any) => {
    console.error('🔍 Enhanced3DBubbleChart - 3D Canvas error:', error);
    setCanvasError('Failed to initialize 3D visualization');
  };

  const handleBubbleClick = (bubble: BubbleData) => {
    console.log('🔍 Enhanced3DBubbleChart - Bubble clicked:', bubble.name);
    onBubbleClick?.(bubble);
  };

  if (canvasError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="font-medium">3D Visualization Error</p>
          <p className="text-sm mt-2">{canvasError}</p>
          <button 
            onClick={() => setCanvasError(null)}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (bubbleData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No data available for 3D visualization</p>
          <p className="text-sm mt-2">Sessions processed: {sessions.length}</p>
          <p className="text-xs mt-1">
            Valid sessions: {sessions.filter(s => s.duration_ms && s.duration_ms > 0 && s.timers?.name).length}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full border rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative">
      <Suspense fallback={
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <Canvas 
          camera={{ position: [12, 8, 12], fov: 60 }}
          onError={handleCanvasError}
          gl={{ antialias: true, alpha: true }}
          className="h-full w-full"
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
          
          {/* Add the proper 3D axis system */}
          <AxisSystem />
          
          {bubbleData.map(bubble => (
            <Bubble
              key={bubble.timerId}
              bubble={bubble}
              onClick={handleBubbleClick}
              isHovered={hoveredTimer === bubble.timerId}
              onHover={setHoveredTimer}
            />
          ))}
          
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={8}
            maxDistance={25}
          />
        </Canvas>
      </Suspense>
      
      {/* Legend showing running vs stopped timers */}
      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-2 text-xs">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Running ({bubbleData.filter(d => d.isRunning).length})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Stopped ({bubbleData.filter(d => !d.isRunning).length})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enhanced3DBubbleChart;
