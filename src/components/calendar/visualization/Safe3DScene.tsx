
import React, { useState } from 'react';
import { OrbitControls, Text, gridHelper } from '@react-three/drei';
import SafeAnimatedBubble from './SafeAnimatedBubble';

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

interface Safe3DSceneProps {
  bubbles: BubbleData[];
  onBubbleClick?: (bubble: BubbleData) => void;
}

export const Safe3DScene: React.FC<Safe3DSceneProps> = ({
  bubbles,
  onBubbleClick
}) => {
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

export default Safe3DScene;
