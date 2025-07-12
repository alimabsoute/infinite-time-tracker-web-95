
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BubbleProps {
  position: [number, number, number];
  size: number;
  color: string;
  timer: any;
  onClick: (timer: any) => void;
}

const AnimatedBubble: React.FC<BubbleProps> = ({ position, size, color, timer, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  console.log('🔍 AnimatedBubble - Rendering bubble:', {
    position,
    size,
    color,
    timerName: timer?.name || 'Unknown'
  });

  useFrame((state) => {
    if (meshRef.current && position && typeof position[0] === 'number') {
      try {
        const floatOffset = Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
        meshRef.current.position.y = position[1] + floatOffset;
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      } catch (error) {
        console.error('🔍 AnimatedBubble - Animation error:', error);
      }
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    console.log('🔍 AnimatedBubble - Bubble clicked:', timer?.name || 'Unknown');
    onClick(timer);
  };

  const handlePointerOver = (event: any) => {
    event.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
  };

  // Validate position and size
  if (!position || position.length !== 3 || position.some(p => typeof p !== 'number' || !isFinite(p))) {
    console.warn('🔍 AnimatedBubble - Invalid position:', position);
    return null;
  }

  if (typeof size !== 'number' || !isFinite(size) || size <= 0) {
    console.warn('🔍 AnimatedBubble - Invalid size:', size);
    return null;
  }

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshPhongMaterial 
        color={color} 
        transparent 
        opacity={0.8}
        shininess={100}
      />
    </mesh>
  );
};

export default AnimatedBubble;
