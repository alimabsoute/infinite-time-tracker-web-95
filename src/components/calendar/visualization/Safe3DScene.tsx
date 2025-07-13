
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
  const [sceneReady, setSceneReady] = useState(false);
  const groupRef = useRef<any>();
  const mountedRef = useRef(true);

  console.log('🔍 Safe3DScene - Rendering with bubbles:', bubbles?.length || 0);

  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        console.log('✅ Safe3DScene - Scene ready');
        setSceneReady(true);
      }
    }, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, []);

  // Safe animation frame with error handling
  useFrame((state, delta) => {
    if (!groupRef.current || !sceneReady || !mountedRef.current) return;
    
    try {
      // Gentle rotation for visual appeal
      groupRef.current.rotation.y += delta * 0.1;
    } catch (error) {
      console.warn('🔍 Safe3DScene - Animation frame error:', error);
    }
  });

  const handleBubbleClick = (bubble: BubbleData) => {
    console.log('🔍 Safe3DScene - Bubble clicked:', bubble.timerName);
    onBubbleClick?.(bubble);
  };

  const handleBubbleHover = (bubbleId: string | null) => {
    setHoveredBubble(bubbleId);
  };

  // Validate bubbles data
  const validBubbles = bubbles?.filter(bubble => 
    bubble &&
    bubble.id &&
    Array.isArray(bubble.position) &&
    bubble.position.length === 3 &&
    typeof bubble.size === 'number' &&
    bubble.size > 0
  ) || [];

  console.log('🔍 Safe3DScene - Valid bubbles:', validBubbles.length, 'out of', bubbles?.length || 0);

  try {
    return (
      <group ref={groupRef}>
        {/* Enhanced lighting setup */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.6} color="#4f46e5" />
        <spotLight
          position={[0, 15, 0]}
          angle={Math.PI / 6}
          penumbra={0.5}
          intensity={0.8}
        />
        
        {/* Grid helper - only show when scene is ready */}
        {sceneReady && (
          <gridHelper 
            args={[20, 20, '#333333', '#666666']} 
            position={[0, -5, 0]} 
          />
        )}
        
        {/* Render bubbles only when scene is ready and bubbles are valid */}
        {sceneReady && validBubbles.length > 0 && validBubbles.map((bubble) => (
          <AnimatedBubble
            key={bubble.id}
            bubble={bubble}
            isHovered={hoveredBubble === bubble.id}
            onClick={() => handleBubbleClick(bubble)}
            onHover={(hovered) => handleBubbleHover(hovered ? bubble.id : null)}
          />
        ))}
        
        {/* Axis labels - only show when scene is ready */}
        {sceneReady && (
          <>
            <Text 
              position={[0, -6.5, 0]} 
              fontSize={0.6} 
              color="#666666" 
              anchorX="center"
              anchorY="middle"
            >
              Total Time (Hours)
            </Text>
            <Text 
              position={[-8, 0, 0]} 
              fontSize={0.6} 
              color="#666666" 
              anchorX="center" 
              anchorY="middle"
              rotation={[0, 0, Math.PI / 2]}
            >
              Avg Session (Minutes)
            </Text>
            <Text 
              position={[0, 0, -8]} 
              fontSize={0.6} 
              color="#666666" 
              anchorX="center" 
              anchorY="middle"
            >
              Activity Distribution
            </Text>
          </>
        )}
        
        {/* Enhanced orbit controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={30}
          target={[0, 0, 0]}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.8}
          zoomSpeed={1.2}
          panSpeed={0.8}
          maxPolarAngle={Math.PI * 0.85}
          minPolarAngle={Math.PI * 0.15}
        />
      </group>
    );
  } catch (error) {
    console.error('❌ Safe3DScene - Render error:', error);
    // Return a simple fallback mesh
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial color="#ef4444" wireframe />
      </mesh>
    );
  }
};

export default Safe3DScene;
