
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { TimerSessionWithTimer } from '../../types';

interface BubbleProps {
  position: [number, number, number];
  size: number;
  color: string;
  timer: any;
  onClick: (timer: any) => void;
}

const Bubble: React.FC<BubbleProps> = ({ position, size, color, timer, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
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

interface TimerBubbleChart3DProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
  onBubbleClick?: (timer: any) => void;
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'Work': '#3b82f6',
  'Personal': '#10b981',
  'Study': '#f59e0b',
  'Exercise': '#ef4444',
  'Health': '#8b5cf6',
  'Uncategorized': '#6b7280',
};

const TimerBubbleChart3D: React.FC<TimerBubbleChart3DProps> = ({ 
  sessions, 
  selectedCategory, 
  onBubbleClick = () => {} 
}) => {
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => 
      session.duration_ms && 
      session.timers &&
      (!selectedCategory || selectedCategory === 'all' || session.timers.category === selectedCategory)
    );
  }, [sessions, selectedCategory]);

  const bubbles = useMemo(() => {
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
      const x = (timer.totalTime / maxTotalTime) * 8 - 4; // Total time on X-axis
      const y = (timer.avgSessionTime / maxAvgTime) * 6 - 3; // Avg session time on Y-axis
      const z = (Math.sin(index * 0.5) * 2); // Distribute in Z axis
      const size = (timer.sessionCount / maxSessionCount) * 0.8 + 0.2; // Session count determines size

      return {
        position: [x, y, z] as [number, number, number],
        size,
        color: CATEGORY_COLORS[timer.category] || CATEGORY_COLORS['Uncategorized'],
        timer
      };
    });
  }, [filteredSessions]);

  return (
    <div className="w-full h-96 border border-gray-200 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        {bubbles.map((bubble, index) => (
          <Bubble
            key={index}
            position={bubble.position}
            size={bubble.size}
            color={bubble.color}
            timer={bubble.timer}
            onClick={onBubbleClick}
          />
        ))}
        
        {/* Axis labels */}
        <Text
          position={[0, -4, 0]}
          fontSize={0.3}
          color="gray"
          anchorX="center"
          anchorY="middle"
        >
          Total Time →
        </Text>
        
        <Text
          position={[-5, 0, 0]}
          fontSize={0.3}
          color="gray"
          anchorX="center"
          anchorY="middle"
          rotation={[0, 0, Math.PI / 2]}
        >
          Avg Session Time →
        </Text>
        
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};

export default TimerBubbleChart3D;
