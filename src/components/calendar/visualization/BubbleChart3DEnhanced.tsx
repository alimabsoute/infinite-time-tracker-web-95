
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { differenceInDays } from 'date-fns';
import { TimerSessionWithTimer } from "../../../types";
import DataValidator from './DataValidator';

interface BubbleData {
  id: string;
  position: [number, number, number];
  size: number;
  color: string;
  timerName: string;
  totalTime: number;
  sessionCount: number;
  creationDate: Date;
  category: string; // Made required instead of optional
}

interface BubbleChart3DEnhancedProps {
  sessions: TimerSessionWithTimer[];
  currentWeekStart: Date;
  onBubbleClick?: (bubble: BubbleData) => void;
  onError?: (error: Error) => void;
}

// Enhanced animated bubble with error handling
const SafeAnimatedBubble: React.FC<{ 
  bubble: BubbleData; 
  isHovered: boolean; 
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}> = ({ bubble, isHovered, onClick, onHover }) => {
  const meshRef = useRef<any>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      try {
        // Safe animation with bounds checking
        const time = state.clock.elapsedTime;
        const floatOffset = Math.sin(time + bubble.position[0]) * 0.1;
        const newY = bubble.position[1] + floatOffset;
        
        if (isFinite(newY) && Math.abs(newY) < 50) {
          meshRef.current.position.y = newY;
        }
        
        meshRef.current.rotation.y += 0.005;
      } catch (error) {
        console.error('🔍 SafeAnimatedBubble - Animation error:', error);
      }
    }
  });

  // Validate bubble data
  if (!bubble || !bubble.position || bubble.position.some(p => !isFinite(p))) {
    console.warn('🔍 SafeAnimatedBubble - Invalid bubble data:', bubble);
    return null;
  }

  return (
    <group position={bubble.position}>
      <Sphere
        ref={meshRef}
        args={[Math.max(0.1, Math.min(bubble.size, 3)), 16, 16]}
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

// Safe 3D scene with error boundaries
const Safe3DScene: React.FC<{
  bubbles: BubbleData[];
  onBubbleClick?: (bubble: BubbleData) => void;
}> = ({ bubbles, onBubbleClick }) => {
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);

  if (!bubbles || bubbles.length === 0) {
    return (
      <>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Text position={[0, 0, 0]} fontSize={0.5} color="white" anchorX="center">
          No Data Available
        </Text>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </>
    );
  }

  return (
    <>
      {/* Enhanced lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
      <spotLight position={[0, 20, 0]} intensity={0.5} angle={Math.PI / 4} />
      
      {/* Reference grid */}
      <gridHelper args={[20, 20, '#333333', '#333333']} position={[0, -5, 0]} />
      
      {/* Render bubbles safely */}
      {bubbles.map((bubble) => (
        <SafeAnimatedBubble
          key={bubble.id}
          bubble={bubble}
          isHovered={hoveredBubble === bubble.id}
          onClick={() => onBubbleClick?.(bubble)}
          onHover={(hovered) => setHoveredBubble(hovered ? bubble.id : null)}
        />
      ))}
      
      {/* Axis labels */}
      <Text position={[0, -6, 0]} fontSize={0.4} color="#666" anchorX="center">
        Week Timeline
      </Text>
      <Text position={[-8, 0, 0]} fontSize={0.4} color="#666" anchorX="center" rotation={[0, 0, Math.PI / 2]}>
        Activity Level
      </Text>
      
      {/* Enhanced controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={30}
        target={[0, 0, 0]}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
};

export const BubbleChart3DEnhanced: React.FC<BubbleChart3DEnhancedProps> = ({
  sessions,
  currentWeekStart,
  onBubbleClick,
  onError
}) => {
  const [renderError, setRenderError] = useState<string | null>(null);

  // Process sessions into bubble data with enhanced validation
  const bubbles = useMemo(() => {
    try {
      console.log('🔍 BubbleChart3DEnhanced - Processing sessions:', sessions.length);
      
      const validation = DataValidator.validateSessions(sessions, currentWeekStart);
      
      if (!validation.hasValidData) {
        console.log('🔍 BubbleChart3DEnhanced - No valid data for bubbles');
        return [];
      }

      // Convert timer groups to bubble data
      const bubbleData: BubbleData[] = Object.entries(validation.timerGroups).map(([timerName, data], index) => {
        try {
          // Safe position calculation
          const daysFromWeekStart = differenceInDays(data.createdAt, currentWeekStart);
          const xPosition = Math.max(-8, Math.min(8, (daysFromWeekStart / 7) * 6));
          const yPosition = (Math.random() - 0.5) * 4;
          const zPosition = (Math.random() - 0.5) * 3;
          
          // Safe size calculation
          const timeInHours = Math.max(0, data.totalTime / 3600000);
          const size = Math.max(0.3, Math.min(2.5, Math.log(timeInHours + 1) * 0.8));
          
          // Validate all values
          const position: [number, number, number] = [xPosition, yPosition, zPosition];
          if (position.some(p => !isFinite(p))) {
            throw new Error(`Invalid position for timer: ${timerName}`);
          }
          
          if (!isFinite(size) || size <= 0) {
            throw new Error(`Invalid size for timer: ${timerName}`);
          }
          
          // Category-based colors - ensure category is always set
          const colors: Record<string, string> = {
            'Work': '#3b82f6',
            'Personal': '#10b981',
            'Study': '#f59e0b',
            'Exercise': '#ef4444',
            'Health': '#8b5cf6',
            'Learning': '#06b6d4',
            'Uncategorized': '#6b7280'
          };
          const category = data.category || 'Uncategorized';
          const color = colors[category] || colors.Uncategorized;
          
          return {
            id: `${timerName}-${index}`,
            position,
            size,
            color,
            timerName,
            totalTime: data.totalTime,
            sessionCount: data.sessions.length,
            creationDate: data.createdAt,
            category // Now guaranteed to be a string
          };
        } catch (error) {
          console.error('🔍 BubbleChart3DEnhanced - Error creating bubble for timer:', timerName, error);
          return null;
        }
      }).filter((bubble): bubble is BubbleData => bubble !== null);

      console.log('🔍 BubbleChart3DEnhanced - Generated bubbles:', bubbleData.length);
      return bubbleData;
    } catch (error) {
      console.error('🔍 BubbleChart3DEnhanced - Error processing bubbles:', error);
      onError?.(error as Error);
      return [];
    }
  }, [sessions, currentWeekStart, onError]);

  // Handle Canvas errors
  const handleCanvasError = (error: Error) => {
    console.error('🔍 BubbleChart3DEnhanced - Canvas error:', error);
    setRenderError(error.message);
    onError?.(error);
  };

  if (renderError) {
    return (
      <div className="h-[400px] flex items-center justify-center text-red-500 bg-red-50/50 rounded-lg">
        <div className="text-center">
          <p className="font-medium">3D Rendering Error</p>
          <p className="text-sm mt-2">{renderError}</p>
          <p className="text-xs mt-2 text-red-400">Falling back to 2D visualization...</p>
        </div>
      </div>
    );
  }

  if (!bubbles || bubbles.length === 0) {
    return (
      <div className="h-[400px] w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <p>No timer data available for 3D visualization</p>
          <p className="text-sm mt-2 text-slate-300">Create timers and log sessions to see the bubble chart</p>
          <p className="text-xs mt-4 text-slate-400">Sessions available: {sessions.length}</p>
        </div>
      </div>
    );
  }

  try {
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
            console.log('🔍 BubbleChart3DEnhanced - Canvas created successfully');
            gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight);
          }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
        >
          <Safe3DScene bubbles={bubbles} onBubbleClick={onBubbleClick} />
        </Canvas>
        
        {/* Enhanced legend */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
          <div className="text-white text-xs space-y-1">
            <div className="font-semibold mb-2">3D Bubble Chart</div>
            <div>• Size = Total time logged</div>
            <div>• Position = Creation timeline</div>
            <div>• Colors = Categories</div>
            <div className="text-slate-300 mt-2">{bubbles.length} timers visualized</div>
          </div>
        </div>
      </motion.div>
    );
  } catch (error) {
    console.error('🔍 BubbleChart3DEnhanced - Render error:', error);
    handleCanvasError(error as Error);
    return null;
  }
};

export default BubbleChart3DEnhanced;
