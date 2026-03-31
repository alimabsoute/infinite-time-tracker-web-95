
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

  useFrame((state) => {
    if (meshRef.current && position && typeof position[0] === 'number') {
      try {
        const floatOffset = Math.sin(state.clock.elapsedTime + position[0]) * 0.15; // Enhanced float
        const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05; // Add pulse effect
        
        meshRef.current.position.y = position[1] + floatOffset;
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.3; // Faster rotation
        meshRef.current.scale.setScalar(pulseScale);
      } catch (error) {
        console.error('AnimatedBubble - Enhanced animation error:', error);
      }
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
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
    console.warn('AnimatedBubble - Invalid position:', position);
    return null;
  }

  if (typeof size !== 'number' || !isFinite(size) || size <= 0) {
    console.warn('AnimatedBubble - Invalid size:', size);
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
      <sphereGeometry args={[size, 20, 20]} />
      <meshPhongMaterial 
        color={color} 
        transparent 
        opacity={0.85}
        shininess={150}
        emissive={color}
        emissiveIntensity={0.1}
      />
    </mesh>
  );
};

export default AnimatedBubble;
