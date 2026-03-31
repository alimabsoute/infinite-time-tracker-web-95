
import React, { useState } from 'react';
import { OrbitControls, Text } from '@react-three/drei';
import AnimatedBubble from './AnimatedBubble';
import { BubbleData } from './BubbleDataProcessor';

interface BubbleScene3DProps {
  bubbles: BubbleData[];
  onBubbleClick?: (bubble: BubbleData) => void;
}

export const BubbleScene3D: React.FC<BubbleScene3DProps> = ({
  bubbles,
  onBubbleClick
}) => {
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

export default BubbleScene3D;
