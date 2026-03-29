
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import { BubbleData } from './BubbleDataProcessor';

interface AnimatedBubbleProps {
  bubble: BubbleData;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}

export const AnimatedBubble: React.FC<AnimatedBubbleProps> = ({
  bubble,
  isHovered,
  onClick,
  onHover
}) => {
  const meshRef = useRef<any>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      try {
        const floatOffset = Math.sin(state.clock.elapsedTime + bubble.position[0]) * 0.1;
        meshRef.current.position.y = bubble.position[1] + floatOffset;
        meshRef.current.rotation.y += 0.005;
      } catch (error) {
        console.error('AnimatedBubble - Animation error:', error);
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

export default AnimatedBubble;
