
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';

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

interface SafeAnimatedBubbleProps {
  bubble: BubbleData;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}

export const SafeAnimatedBubble: React.FC<SafeAnimatedBubbleProps> = ({
  bubble,
  isHovered,
  onClick,
  onHover
}) => {
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

export default SafeAnimatedBubble;
