
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TimerSessionWithTimer } from '../../../types';

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
    if (meshRef.current) {
      const floatOffset = Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      meshRef.current.position.y = position[1] + floatOffset;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => onClick(timer)}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <sphereGeometry args={[size, 32, 32]} />
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
