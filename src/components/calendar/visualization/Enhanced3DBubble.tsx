
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Sphere } from '@react-three/drei';
import { BubbleData } from './BubbleDataProcessor';
import * as THREE from 'three';

interface Enhanced3DBubbleProps {
  bubble: BubbleData;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  animationEnabled?: boolean;
}

const Enhanced3DBubble: React.FC<Enhanced3DBubbleProps> = ({
  bubble,
  isHovered,
  onClick,
  onHover,
  animationEnabled = true
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [pulsePhase, setPulsePhase] = useState(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (meshRef.current && animationEnabled) {
      try {
        // Floating animation
        const floatOffset = Math.sin(state.clock.elapsedTime * 0.8 + pulsePhase) * 0.1;
        meshRef.current.position.y = bubble.position[1] + floatOffset;
        
        // Gentle rotation
        meshRef.current.rotation.y += 0.003;
        
        // Pulsing for running timers
        if (bubble.isRunning) {
          const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
          meshRef.current.scale.setScalar(pulse);
        }
        
        // Hover effects
        if (isHovered) {
          meshRef.current.scale.multiplyScalar(1.1);
        }
      } catch (error) {
        console.warn('🔍 Enhanced3DBubble - Animation error:', error);
      }
    }
  });

  // Enhanced material properties
  const material = {
    color: bubble.color,
    transparent: true,
    opacity: isHovered ? 0.9 : 0.75,
    shininess: bubble.isRunning ? 150 : 100,
    emissive: bubble.isRunning ? new THREE.Color(bubble.color).multiplyScalar(0.1) : new THREE.Color(0x000000),
    emissiveIntensity: bubble.isRunning ? 0.2 : 0
  };

  return (
    <group position={bubble.position}>
      <Sphere
        ref={meshRef}
        args={[bubble.size, 32, 32]}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onHover(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <meshPhongMaterial {...material} />
      </Sphere>

      {/* Enhanced tooltip */}
      {isHovered && (
        <Html center>
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-4 text-sm min-w-48 pointer-events-none shadow-xl">
            <div className="font-bold text-foreground mb-2 flex items-center gap-2">
              {bubble.timerName}
              {bubble.isRunning && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Running
                </span>
              )}
            </div>
            <div className="text-muted-foreground text-xs mb-3">{bubble.category}</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="font-medium text-foreground">Sessions</div>
                <div className="text-muted-foreground">{bubble.sessionCount}</div>
              </div>
              <div>
                <div className="font-medium text-foreground">Total Time</div>
                <div className="text-muted-foreground">{bubble.totalHours}h</div>
              </div>
              <div>
                <div className="font-medium text-foreground">Avg Session</div>
                <div className="text-muted-foreground">{bubble.avgMinutes}m</div>
              </div>
              <div>
                <div className="font-medium text-foreground">Size</div>
                <div className="text-muted-foreground">{bubble.size.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </Html>
      )}

      {/* Running timer indicator ring */}
      {bubble.isRunning && (
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[bubble.size + 0.1, bubble.size + 0.2, 32]} />
          <meshBasicMaterial 
            color="#22c55e" 
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

export default Enhanced3DBubble;
