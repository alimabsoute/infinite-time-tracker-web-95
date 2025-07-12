
import React, { useState, useRef, useEffect } from 'react';
import { OrbitControls, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import AnimatedBubble from './AnimatedBubble';
import { BubbleData } from './BubbleDataProcessor';

interface Safe3DSceneProps {
  bubbles: BubbleData[];
  onBubbleClick?: (bubble: BubbleData) => void;
}

export const Safe3DScene: React.FC<Safe3DSceneProps> = ({
  bubbles,
  onBubbleClick
}) => {
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  const groupRef = useRef<any>();
  const [isReady, setIsReady] = useState(false);

  // Ensure scene is ready before rendering complex elements
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Safe animation frame
  useFrame((state, delta) => {
    if (groupRef.current && isReady) {
      try {
        // Gentle rotation for the scene
        groupRef.current.rotation.y += delta * 0.1;
      } catch (error) {
        console.warn('🔍 Safe3DScene - Animation frame error:', error);
      }
    }
  });

  try {
    return (
      <group ref={groupRef}>
        {/* Lighting setup */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
        
        {/* Grid helper - only render when ready */}
        {isReady && (
          <gridHelper args={[20, 20, '#333333', '#333333']} position={[0, -5, 0]} />
        )}
        
        {/* Bubbles - only render when ready and bubbles exist */}
        {isReady && bubbles && bubbles.length > 0 && bubbles.map((bubble) => (
          <AnimatedBubble
            key={bubble.id}
            bubble={bubble}
            isHovered={hoveredBubble === bubble.id}
            onClick={() => onBubbleClick?.(bubble)}
            onHover={(hovered) => setHoveredBubble(hovered ? bubble.id : null)}
          />
        ))}
        
        {/* Text labels - only render when ready */}
        {isReady && (
          <>
            <Text position={[0, -6, 0]} fontSize={0.5} color="#666" anchorX="center">
              Time in Date Range
            </Text>
            <Text position={[-10, 0, 0]} fontSize={0.5} color="#666" anchorX="center" rotation={[0, 0, Math.PI / 2]}>
              Activity Level
            </Text>
          </>
        )}
        
        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={25}
          target={[0, 0, 0]}
          enableDamping={true}
          dampingFactor={0.1}
        />
      </group>
    );
  } catch (error) {
    console.error('🔍 Safe3DScene - Render error:', error);
    // Return a simple fallback mesh
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="red" />
      </mesh>
    );
  }
};

export default Safe3DScene;
