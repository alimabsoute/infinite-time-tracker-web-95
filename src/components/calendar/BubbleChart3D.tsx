import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import { Vector3, Color } from 'three';
import { motion } from 'framer-motion';
import { format, differenceInDays, startOfWeek } from 'date-fns';
import { TimerSessionWithTimer } from "../../types";

interface BubbleData {
  id: string;
  position: [number, number, number];
  size: number;
  color: string;
  timerName: string;
  totalTime: number;
  sessionCount: number;
  creationDate: Date;
  category?: string;
}

interface BubbleChart3DProps {
  sessions: TimerSessionWithTimer[];
  currentWeekStart: Date;
  onBubbleClick?: (bubble: BubbleData) => void;
}

// Individual animated bubble component
const AnimatedBubble: React.FC<{ 
  bubble: BubbleData; 
  isHovered: boolean; 
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}> = ({ bubble, isHovered, onClick, onHover }) => {
  const meshRef = useRef<any>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = bubble.position[1] + Math.sin(state.clock.elapsedTime + bubble.position[0]) * 0.1;
      // Subtle rotation
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group position={bubble.position}>
      <Sphere
        ref={meshRef}
        args={[bubble.size, 32, 32]}
        onClick={onClick}
        onPointerOver={() => onHover(true)}
        onPointerOut={() => onHover(false)}
      >
        <meshPhongMaterial
          color={bubble.color}
          transparent
          opacity={isHovered ? 0.9 : 0.7}
          shininess={100}
        />
      </Sphere>
      
      {isHovered && (
        <Text
          position={[0, bubble.size + 0.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {bubble.timerName}
        </Text>
      )}
    </group>
  );
};

// Main 3D scene component
const BubbleScene: React.FC<{
  bubbles: BubbleData[];
  onBubbleClick?: (bubble: BubbleData) => void;
}> = ({ bubbles, onBubbleClick }) => {
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
      
      {/* Grid/Ground plane for reference */}
      <gridHelper args={[20, 20, '#333333', '#333333']} position={[0, -5, 0]} />
      
      {/* Render bubbles */}
      {bubbles.map((bubble) => (
        <AnimatedBubble
          key={bubble.id}
          bubble={bubble}
          isHovered={hoveredBubble === bubble.id}
          onClick={() => onBubbleClick?.(bubble)}
          onHover={(hovered) => setHoveredBubble(hovered ? bubble.id : null)}
        />
      ))}
      
      {/* Axis labels */}
      <Text position={[0, -6, 0]} fontSize={0.5} color="#666" anchorX="center">
        Time in Week
      </Text>
      <Text position={[-10, 0, 0]} fontSize={0.5} color="#666" anchorX="center" rotation={[0, 0, Math.PI / 2]}>
        Activity Level
      </Text>
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={25}
        target={[0, 0, 0]}
      />
    </>
  );
};

export const BubbleChart3D: React.FC<BubbleChart3DProps> = ({
  sessions,
  currentWeekStart,
  onBubbleClick
}) => {
  // Process sessions into bubble data
  const bubbles = useMemo(() => {
    console.log('🔍 BubbleChart3D - Processing sessions:', sessions.length);
    
    // Group sessions by timer
    const timerGroups = sessions.reduce((acc, session) => {
      if (!session.timers?.name) return acc;
      
      const timerName = session.timers.name;
      if (!acc[timerName]) {
        acc[timerName] = {
          sessions: [],
          totalTime: 0,
          category: session.timers.category || 'Uncategorized',
          createdAt: new Date(session.start_time)
        };
      }
      
      acc[timerName].sessions.push(session);
      acc[timerName].totalTime += session.duration_ms || 0;
      
      return acc;
    }, {} as Record<string, any>);

    console.log('🔍 BubbleChart3D - Timer groups:', Object.keys(timerGroups).length);

    // Convert to bubble data
    const bubbleData: BubbleData[] = Object.entries(timerGroups).map(([timerName, data], index) => {
      // Position calculation
      const daysFromWeekStart = differenceInDays(data.createdAt, currentWeekStart);
      const xPosition = Math.max(-8, Math.min(8, (daysFromWeekStart / 7) * 8)); // X: creation date relative to week
      const yPosition = Math.random() * 6 - 3; // Y: randomized for visual separation
      const zPosition = Math.random() * 4 - 2; // Z: randomized depth
      
      // Size based on total time (log scale for better visualization)
      const timeInHours = data.totalTime / 3600000;
      const size = Math.max(0.3, Math.min(2, Math.log(timeInHours + 1) * 0.8));
      
      // Color based on category
      const colors = {
        'Work': '#3b82f6',
        'Personal': '#10b981',
        'Study': '#f59e0b',
        'Exercise': '#ef4444',
        'Uncategorized': '#6b7280'
      };
      const color = colors[data.category as keyof typeof colors] || colors.Uncategorized;
      
      return {
        id: `${timerName}-${index}`,
        position: [xPosition, yPosition, zPosition] as [number, number, number],
        size,
        color,
        timerName,
        totalTime: data.totalTime,
        sessionCount: data.sessions.length,
        creationDate: data.createdAt,
        category: data.category
      };
    });

    console.log('🔍 BubbleChart3D - Generated bubbles:', bubbleData.length);
    return bubbleData;
  }, [sessions, currentWeekStart]);

  const handleBubbleClick = (bubble: BubbleData) => {
    console.log('🔍 BubbleChart3D - Bubble clicked:', bubble.timerName);
    onBubbleClick?.(bubble);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[400px] w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden"
    >
      <Canvas
        camera={{ position: [0, 5, 15], fov: 50 }}
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <BubbleScene bubbles={bubbles} onBubbleClick={handleBubbleClick} />
      </Canvas>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
        <div className="text-white text-xs space-y-1">
          <div className="font-semibold mb-2">Legend</div>
          <div>• Bubble size = Total time logged</div>
          <div>• X-axis = Timer creation date</div>
          <div>• Colors = Categories</div>
        </div>
      </div>
    </motion.div>
  );
};

export default BubbleChart3D;