
import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { differenceInDays, startOfWeek } from 'date-fns';
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
  category: string;
}

interface BubbleChart3DProps {
  sessions: TimerSessionWithTimer[];
  currentWeekStart: Date;
  onBubbleClick?: (bubble: BubbleData) => void;
}

// Simplified animated bubble component
const AnimatedBubble: React.FC<{ 
  bubble: BubbleData; 
  isHovered: boolean; 
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}> = ({ bubble, isHovered, onClick, onHover }) => {
  const meshRef = useRef<any>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      try {
        const floatOffset = Math.sin(state.clock.elapsedTime + bubble.position[0]) * 0.1;
        meshRef.current.position.y = bubble.position[1] + floatOffset;
        meshRef.current.rotation.y += 0.005;
      } catch (error) {
        console.error('BubbleChart3D - Animation error:', error);
      }
    }
  });

  return (
    <group position={bubble.position}>
      <Sphere
        ref={meshRef}
        args={[bubble.size, 16, 16]}
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
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
      
      <gridHelper args={[20, 20, '#333333', '#333333']} position={[0, -5, 0]} />
      
      {bubbles.map((bubble) => (
        <AnimatedBubble
          key={bubble.id}
          bubble={bubble}
          isHovered={hoveredBubble === bubble.id}
          onClick={() => onBubbleClick?.(bubble)}
          onHover={(hovered) => setHoveredBubble(hovered ? bubble.id : null)}
        />
      ))}
      
      <Text position={[0, -6, 0]} fontSize={0.5} color="#666" anchorX="center">
        Time in Week
      </Text>
      <Text position={[-10, 0, 0]} fontSize={0.5} color="#666" anchorX="center" rotation={[0, 0, Math.PI / 2]}>
        Activity Level
      </Text>
      
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
  // Simplified data processing
  const bubbles = useMemo(() => {
    console.log('🔍 BubbleChart3D - Processing sessions:', sessions.length);
    
    if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
      console.log('🔍 BubbleChart3D - No valid sessions data');
      return [];
    }

    if (!currentWeekStart || !(currentWeekStart instanceof Date)) {
      console.log('🔍 BubbleChart3D - Invalid currentWeekStart');
      return [];
    }

    // Group sessions by timer with improved validation
    const timerGroups: Record<string, any> = {};

    sessions.forEach(session => {
      try {
        // Extract timer name with proper fallback
        let timerName: string | undefined;
        let category = 'Uncategorized';
        
        if (session.timers?.name) {
          timerName = session.timers.name;
          category = session.timers.category || 'Uncategorized';
        }
        
        if (!timerName || typeof timerName !== 'string' || timerName.trim() === '') {
          console.warn('🔍 BubbleChart3D - Skipping session with invalid timer name:', session.id);
          return;
        }
        
        // Initialize timer group
        if (!timerGroups[timerName]) {
          timerGroups[timerName] = {
            sessions: [],
            totalTime: 0,
            category,
            createdAt: new Date(session.start_time),
            timerId: session.timer_id || session.id
          };
        }
        
        // Add session and calculate duration
        timerGroups[timerName].sessions.push(session);
        
        let sessionDuration = 0;
        if (session.duration_ms && typeof session.duration_ms === 'number' && session.duration_ms > 0) {
          sessionDuration = session.duration_ms;
        } else if (session.end_time && session.start_time) {
          const startTime = new Date(session.start_time).getTime();
          const endTime = new Date(session.end_time).getTime();
          if (endTime > startTime) {
            sessionDuration = endTime - startTime;
          }
        }
        
        timerGroups[timerName].totalTime += sessionDuration;
      } catch (error) {
        console.error('🔍 BubbleChart3D - Error processing session:', error);
      }
    });

    console.log('🔍 BubbleChart3D - Timer groups created:', Object.keys(timerGroups).length);

    // Convert to bubble data
    const bubbleData: BubbleData[] = Object.entries(timerGroups).map(([timerName, data], index) => {
      try {
        // Position calculation
        const daysFromWeekStart = differenceInDays(data.createdAt, currentWeekStart);
        const xPosition = Math.max(-8, Math.min(8, (daysFromWeekStart / 7) * 8));
        const yPosition = Math.random() * 6 - 3;
        const zPosition = Math.random() * 4 - 2;
        
        // Size calculation
        const timeInHours = Math.max(0, data.totalTime / 3600000);
        const size = Math.max(0.3, Math.min(2, Math.log(timeInHours + 1) * 0.8));
        
        // Validate values
        if (!isFinite(xPosition) || !isFinite(yPosition) || !isFinite(zPosition) || !isFinite(size)) {
          console.warn('🔍 BubbleChart3D - Invalid values for timer:', timerName);
          return null;
        }
        
        // Category colors
        const colors: Record<string, string> = {
          'Work': '#3b82f6',
          'Personal': '#10b981',
          'Study': '#f59e0b',
          'Exercise': '#ef4444',
          'Health': '#8b5cf6',
          'Learning': '#06b6d4',
          'Uncategorized': '#6b7280'
        };
        const color = colors[data.category] || colors.Uncategorized;
        
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
      } catch (error) {
        console.error('🔍 BubbleChart3D - Error creating bubble for timer:', timerName, error);
        return null;
      }
    }).filter((bubble): bubble is BubbleData => bubble !== null);

    console.log('🔍 BubbleChart3D - Generated bubbles:', bubbleData.length);
    return bubbleData;
  }, [sessions, currentWeekStart]);

  const handleBubbleClick = (bubble: BubbleData) => {
    console.log('🔍 BubbleChart3D - Bubble clicked:', bubble.timerName);
    onBubbleClick?.(bubble);
  };

  if (!bubbles || bubbles.length === 0) {
    console.log('🔍 BubbleChart3D - No bubbles to render');
    return (
      <motion.div 
        className="h-[400px] w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center text-white">
          <p>No timer data available for this week</p>
          <p className="text-sm mt-2 text-slate-300">Create some timers and log time to see the 3D visualization</p>
          <p className="text-xs mt-4 text-slate-400">Debug: {sessions.length} sessions available</p>
        </div>
      </motion.div>
    );
  }

  console.log('🔍 BubbleChart3D - Rendering with', bubbles.length, 'bubbles');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[400px] w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden relative"
    >
      <Canvas
        camera={{ position: [0, 5, 15], fov: 50 }}
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
        onCreated={({ gl }) => {
          console.log('🔍 BubbleChart3D - Canvas created successfully');
          gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight);
        }}
      >
        <BubbleScene bubbles={bubbles} onBubbleClick={handleBubbleClick} />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
        <div className="text-white text-xs space-y-1">
          <div className="font-semibold mb-2">3D Bubble Chart</div>
          <div>• Bubble size = Total time logged</div>
          <div>• X-axis = Timer creation date</div>
          <div>• Colors = Categories</div>
          <div className="text-slate-300 mt-2">Showing {bubbles.length} timers</div>
        </div>
      </div>
    </motion.div>
  );
};

export default BubbleChart3D;
