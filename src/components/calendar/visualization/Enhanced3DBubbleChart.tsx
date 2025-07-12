
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import * as THREE from 'three';
import { TimerSessionWithTimer } from '../../../types';

interface BubbleProps {
  position: [number, number, number];
  size: number;
  color: string;
  timer: any;
  onClick: (timer: any) => void;
}

const PASTEL_COLORS_3D: { [key: string]: string } = {
  'Work': '#93C5FD',        // Light blue
  'Personal': '#A7F3D0',    // Light green
  'Study': '#FDE047',       // Light yellow
  'Exercise': '#FCA5A5',    // Light red
  'Health': '#C4B5FD',      // Light purple
  'Uncategorized': '#D1D5DB', // Light gray
};

const AnimatedBubble: React.FC<BubbleProps> = ({ position, size, color, timer, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const floatOffset = Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      meshRef.current.position.y = position[1] + floatOffset;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => onClick(timer)}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <sphereGeometry args={[size, 32, 32]} />
      <meshPhongMaterial 
        color={color} 
        transparent 
        opacity={0.8}
        shininess={100}
      />
    </mesh>
  );
};

const AxisLines: React.FC = () => {
  const xAxisPoints: [number, number, number][] = [[-8, 0, 0], [8, 0, 0]];
  const yAxisPoints: [number, number, number][] = [[0, -6, 0], [0, 6, 0]];
  const zAxisPoints: [number, number, number][] = [[0, 0, -8], [0, 0, 8]];

  return (
    <>
      <Line points={xAxisPoints} color="#ef4444" lineWidth={2} />
      <Line points={yAxisPoints} color="#22c55e" lineWidth={2} />
      <Line points={zAxisPoints} color="#3b82f6" lineWidth={2} />
      
      {/* Axis arrows */}
      <mesh position={[8.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 6.5, 0]}>
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      <mesh position={[0, 0, 8.5]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
    </>
  );
};

interface Enhanced3DBubbleChartProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
  onBubbleClick?: (timer: any) => void;
}

const Enhanced3DBubbleChart: React.FC<Enhanced3DBubbleChartProps> = ({ 
  sessions, 
  selectedCategory, 
  onBubbleClick = () => {} 
}) => {
  const controlsRef = useRef<any>();
  const [cameraKey, setCameraKey] = useState(0);

  const filteredSessions = React.useMemo(() => {
    return sessions.filter(session => 
      session.duration_ms && 
      session.timers &&
      (!selectedCategory || selectedCategory === 'all' || session.timers.category === selectedCategory)
    );
  }, [sessions, selectedCategory]);

  const bubbles = React.useMemo(() => {
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
        totalTime,
        sessionCount,
        avgSessionTime,
        sessions: timerSessions
      };
    });

    if (timerMetrics.length === 0) return [];

    const maxTotalTime = Math.max(...timerMetrics.map(t => t.totalTime));
    const maxSessionCount = Math.max(...timerMetrics.map(t => t.sessionCount));
    const maxAvgTime = Math.max(...timerMetrics.map(t => t.avgSessionTime));

    return timerMetrics.map((timer, index) => {
      const x = (timer.totalTime / maxTotalTime) * 6 - 3; // Total time on X-axis
      const y = (timer.avgSessionTime / maxAvgTime) * 4 - 2; // Avg session time on Y-axis
      const z = (Math.sin(index * 0.8) * 3); // Distribute in Z axis
      const size = (timer.sessionCount / maxSessionCount) * 0.6 + 0.3; // Session count determines size

      return {
        position: [x, y, z] as [number, number, number],
        size,
        color: PASTEL_COLORS_3D[timer.category] || PASTEL_COLORS_3D['Uncategorized'],
        timer
      };
    });
  }, [filteredSessions]);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    setCameraKey(prev => prev + 1);
  };

  if (bubbles.length === 0) {
    return (
      <div className="h-[400px] w-full bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No timer data available for 3D visualization</p>
          <p className="text-sm mt-2">Create timers and log sessions to see the bubble chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[400px] w-full border border-gray-200 rounded-lg overflow-hidden">
      <Canvas 
        key={cameraKey}
        camera={{ position: [8, 6, 8], fov: 60 }}
        style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        <AxisLines />
        
        {bubbles.map((bubble, index) => (
          <AnimatedBubble
            key={index}
            position={bubble.position}
            size={bubble.size}
            color={bubble.color}
            timer={bubble.timer}
            onClick={onBubbleClick}
          />
        ))}
        
        {/* Enhanced axis labels with better visibility */}
        <Text
          position={[9, -0.5, 0]}
          fontSize={0.6}
          color="#374151"
          anchorX="center"
          anchorY="middle"
          font="/fonts/bold.woff"
        >
          Total Time →
        </Text>
        
        <Text
          position={[-0.5, 7, 0]}
          fontSize={0.6}
          color="#374151"
          anchorX="center"
          anchorY="middle"
          rotation={[0, 0, Math.PI / 2]}
          font="/fonts/bold.woff"
        >
          ↑ Avg Session Time
        </Text>
        
        <Text
          position={[0, -0.5, 9]}
          fontSize={0.6}
          color="#374151"
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI / 2, 0]}
          font="/fonts/bold.woff"
        >
          Activity Distribution →
        </Text>
        
        <OrbitControls
          ref={controlsRef}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>
      
      {/* Reset/Home button */}
      <Button
        onClick={resetCamera}
        size="sm"
        variant="outline"
        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm"
      >
        <Home className="h-4 w-4" />
      </Button>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="font-semibold mb-2">3D Bubble Chart</div>
        <div className="space-y-1">
          <div>• X-axis: Total time logged</div>
          <div>• Y-axis: Average session time</div>
          <div>• Size: Number of sessions</div>
          <div>• Colors: Timer categories</div>
        </div>
      </div>
    </div>
  );
};

export default Enhanced3DBubbleChart;
