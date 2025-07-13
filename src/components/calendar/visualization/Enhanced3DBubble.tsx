
import React, { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
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
  const [pulsePhase] = useState(() => Math.random() * Math.PI * 2);
  const [isInitialized, setIsInitialized] = useState(false);

  // Safe frame animation with error handling
  useFrame((state) => {
    if (!meshRef.current || !animationEnabled || !bubble) return;
    
    try {
      const mesh = meshRef.current;
      const time = state.clock.elapsedTime;
      
      // Validate bubble position
      if (!Array.isArray(bubble.position) || bubble.position.length !== 3) {
        console.warn('🔍 Enhanced3DBubble - Invalid bubble position:', bubble.position);
        return;
      }

      // Safe floating animation
      const floatOffset = Math.sin(time * 0.8 + pulsePhase) * 0.1;
      const baseY = typeof bubble.position[1] === 'number' ? bubble.position[1] : 0;
      mesh.position.y = baseY + floatOffset;
      
      // Safe rotation
      mesh.rotation.y += 0.003;
      
      // Safe pulsing for running timers
      if (bubble.isRunning) {
        const pulse = 1 + Math.sin(time * 3) * 0.1;
        mesh.scale.setScalar(pulse * (bubble.size || 1));
      } else {
        mesh.scale.setScalar(bubble.size || 1);
      }
      
      // Safe hover effects
      if (isHovered) {
        mesh.scale.multiplyScalar(1.1);
      }

      if (!isInitialized) {
        setIsInitialized(true);
      }
    } catch (error) {
      console.warn('🔍 Enhanced3DBubble - Animation error:', error);
    }
  });

  // Safe event handlers
  const handleClick = useCallback((event: any) => {
    event?.stopPropagation?.();
    onClick?.();
  }, [onClick]);

  const handlePointerOver = useCallback((event: any) => {
    event?.stopPropagation?.();
    onHover?.(true);
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'pointer';
    }
  }, [onHover]);

  const handlePointerOut = useCallback(() => {
    onHover?.(false);
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'auto';
    }
  }, [onHover]);

  // Validate required props
  if (!bubble || !Array.isArray(bubble.position) || bubble.position.length !== 3) {
    console.warn('🔍 Enhanced3DBubble - Invalid bubble data:', bubble);
    return null;
  }

  // Safe position and size values
  const position: [number, number, number] = [
    typeof bubble.position[0] === 'number' ? bubble.position[0] : 0,
    typeof bubble.position[1] === 'number' ? bubble.position[1] : 0,
    typeof bubble.position[2] === 'number' ? bubble.position[2] : 0
  ];
  
  const size = typeof bubble.size === 'number' && bubble.size > 0 ? bubble.size : 0.5;
  const color = bubble.color || '#3b82f6';

  // Enhanced material properties with safe defaults
  const materialProps = {
    color: color,
    transparent: true,
    opacity: isHovered ? 0.9 : 0.75,
    shininess: bubble.isRunning ? 150 : 100,
    emissive: bubble.isRunning ? new THREE.Color(color).multiplyScalar(0.1) : new THREE.Color(0x000000),
    emissiveIntensity: bubble.isRunning ? 0.2 : 0
  };

  try {
    return (
      <group position={position}>
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <sphereGeometry args={[size, Math.max(8, Math.min(32, size * 20)), Math.max(8, Math.min(32, size * 20))]} />
          <meshPhongMaterial {...materialProps} />
        </mesh>

        {/* Enhanced tooltip with safe rendering */}
        {isHovered && isInitialized && (
          <Html center>
            <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-4 text-sm min-w-48 pointer-events-none shadow-xl">
              <div className="font-bold text-foreground mb-2 flex items-center gap-2">
                {bubble.timerName || 'Unknown Timer'}
                {bubble.isRunning && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Running
                  </span>
                )}
              </div>
              <div className="text-muted-foreground text-xs mb-3">{bubble.category || 'Uncategorized'}</div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="font-medium text-foreground">Sessions</div>
                  <div className="text-muted-foreground">{bubble.sessionCount || 0}</div>
                </div>
                <div>
                  <div className="font-medium text-foreground">Total Time</div>
                  <div className="text-muted-foreground">{bubble.totalHours || '0'}h</div>
                </div>
                <div>
                  <div className="font-medium text-foreground">Avg Session</div>
                  <div className="text-muted-foreground">{bubble.avgMinutes || '0'}m</div>
                </div>
                <div>
                  <div className="font-medium text-foreground">Size</div>
                  <div className="text-muted-foreground">{size.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </Html>
        )}

        {/* Running timer indicator ring with safe rendering */}
        {bubble.isRunning && (
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size + 0.1, size + 0.2, Math.max(8, Math.min(32, size * 20))]} />
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
  } catch (error) {
    console.error('🔍 Enhanced3DBubble - Render error:', error);
    return null;
  }
};

export default Enhanced3DBubble;
