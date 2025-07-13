
import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Enhanced3DAxes from './Enhanced3DAxes';
import Enhanced3DCamera from './Enhanced3DCamera';
import Enhanced3DBubble from './Enhanced3DBubble';
import { BubbleData } from './BubbleDataProcessor';
import * as THREE from 'three';

interface Enhanced3DSceneProps {
  bubbles: BubbleData[];
  onBubbleClick?: (bubble: BubbleData) => void;
  autoRotate?: boolean;
  showAxes?: boolean;
  showGrid?: boolean;
}

const Enhanced3DScene: React.FC<Enhanced3DSceneProps> = ({
  bubbles,
  onBubbleClick,
  autoRotate = false,
  showAxes = true,
  showGrid = true
}) => {
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  const [cameraPosition, setCameraPosition] = useState<THREE.Vector3>(new THREE.Vector3());
  const ambientLightRef = useRef<THREE.AmbientLight>(null);

  // Dynamic lighting based on camera position
  useFrame(() => {
    if (ambientLightRef.current) {
      const distance = cameraPosition.length();
      const intensity = Math.max(0.3, Math.min(0.8, 1 - distance / 30));
      ambientLightRef.current.intensity = intensity;
    }
  });

  const handleBubbleClick = (bubble: BubbleData) => {
    console.log('🔍 Enhanced3DScene - Bubble clicked:', bubble.timerName);
    onBubbleClick?.(bubble);
  };

  return (
    <>
      {/* Enhanced lighting setup */}
      <ambientLight ref={ambientLightRef} intensity={0.5} />
      <pointLight position={[15, 15, 15]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#4f46e5" />
      <spotLight
        position={[0, 20, 0]}
        angle={Math.PI / 6}
        penumbra={0.5}
        intensity={0.8}
        castShadow
      />

      {/* Enhanced axes system */}
      {showAxes && (
        <Enhanced3DAxes 
          size={12} 
          showGrid={showGrid} 
          showLabels={true} 
        />
      )}

      {/* Bubbles */}
      {bubbles.map((bubble) => (
        <Enhanced3DBubble
          key={bubble.id}
          bubble={bubble}
          isHovered={hoveredBubble === bubble.id}
          onClick={() => handleBubbleClick(bubble)}
          onHover={(hovered) => setHoveredBubble(hovered ? bubble.id : null)}
          animationEnabled={true}
        />
      ))}

      {/* Enhanced camera controls */}
      <Enhanced3DCamera
        autoRotate={autoRotate}
        enableZoom={true}
        enablePan={true}
        minDistance={10}
        maxDistance={35}
        onCameraChange={setCameraPosition}
      />

      {/* Background environment */}
      <mesh position={[0, 0, -20]} rotation={[0, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial 
          color="#1a1a2e" 
          transparent 
          opacity={0.1}
        />
      </mesh>
    </>
  );
};

export default Enhanced3DScene;
