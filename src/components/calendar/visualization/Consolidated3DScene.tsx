
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { BubbleData } from './BubbleDataProcessor';
import * as THREE from 'three';

interface Consolidated3DSceneProps {
  bubbles: BubbleData[];
  onBubbleClick?: (bubble: BubbleData) => void;
  autoRotate?: boolean;
  showAxes?: boolean;
  showGrid?: boolean;
}

// Individual bubble component with all animations and interactions
const Interactive3DBubble: React.FC<{
  bubble: BubbleData;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}> = ({ bubble, isHovered, onClick, onHover }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [pulsePhase] = useState(() => Math.random() * Math.PI * 2);

  // Safe animation with error handling
  useFrame((state) => {
    if (!meshRef.current || !bubble) return;
    
    try {
      const mesh = meshRef.current;
      const time = state.clock.elapsedTime;
      
      // Floating animation
      const floatOffset = Math.sin(time * 0.8 + pulsePhase) * 0.1;
      const baseY = typeof bubble.position[1] === 'number' ? bubble.position[1] : 0;
      mesh.position.y = baseY + floatOffset;
      
      // Gentle rotation
      mesh.rotation.y += 0.003;
      
      // Pulsing for running timers
      if (bubble.isRunning) {
        const pulse = 1 + Math.sin(time * 3) * 0.1;
        mesh.scale.setScalar(pulse * (bubble.size || 1));
      } else {
        mesh.scale.setScalar(bubble.size || 1);
      }
      
      // Hover effects
      if (isHovered) {
        mesh.scale.multiplyScalar(1.1);
      }
    } catch (error) {
      console.warn('🔍 Interactive3DBubble - Animation error:', error);
    }
  });

  // Validate bubble data
  if (!bubble || !Array.isArray(bubble.position) || bubble.position.length !== 3) {
    return null;
  }

  const position: [number, number, number] = [
    typeof bubble.position[0] === 'number' ? bubble.position[0] : 0,
    typeof bubble.position[1] === 'number' ? bubble.position[1] : 0,
    typeof bubble.position[2] === 'number' ? bubble.position[2] : 0
  ];
  
  const size = typeof bubble.size === 'number' && bubble.size > 0 ? bubble.size : 0.5;
  const color = bubble.color || '#3b82f6';

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
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
        <sphereGeometry args={[size, Math.max(8, Math.min(32, size * 20)), Math.max(8, Math.min(32, size * 20))]} />
        <meshPhongMaterial 
          color={color}
          transparent 
          opacity={isHovered ? 0.9 : 0.75}
          shininess={bubble.isRunning ? 150 : 100}
          emissive={bubble.isRunning ? new THREE.Color(color).multiplyScalar(0.1) : new THREE.Color(0x000000)}
          emissiveIntensity={bubble.isRunning ? 0.2 : 0}
        />
      </mesh>

      {/* Enhanced tooltip */}
      {isHovered && (
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

      {/* Running timer indicator ring */}
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
};

// Main consolidated scene component
const Consolidated3DScene: React.FC<Consolidated3DSceneProps> = ({
  bubbles,
  onBubbleClick,
  autoRotate = false,
  showAxes = true,
  showGrid = true
}) => {
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const groupRef = useRef<any>();
  const mountedRef = useRef(true);

  console.log('🔍 Consolidated3DScene - Rendering with bubbles:', bubbles?.length || 0);

  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        console.log('✅ Consolidated3DScene - Scene ready');
        setSceneReady(true);
      }
    }, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, []);

  // Safe animation frame
  useFrame((state, delta) => {
    if (!groupRef.current || !sceneReady || !mountedRef.current) return;
    
    try {
      if (autoRotate) {
        groupRef.current.rotation.y += delta * 0.1;
      }
    } catch (error) {
      console.warn('🔍 Consolidated3DScene - Animation frame error:', error);
    }
  });

  const handleBubbleClick = (bubble: BubbleData) => {
    console.log('🔍 Consolidated3DScene - Bubble clicked:', bubble.timerName);
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

  console.log('🔍 Consolidated3DScene - Valid bubbles:', validBubbles.length, 'out of', bubbles?.length || 0);

  try {
    return (
      <Suspense fallback={null}>
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
          
          {/* Grid helper */}
          {sceneReady && showGrid && (
            <gridHelper 
              args={[20, 20, '#333333', '#666666']} 
              position={[0, -5, 0]} 
            />
          )}
          
          {/* Render bubbles */}
          {sceneReady && validBubbles.length > 0 && validBubbles.map((bubble) => (
            <Interactive3DBubble
              key={bubble.id}
              bubble={bubble}
              isHovered={hoveredBubble === bubble.id}
              onClick={() => handleBubbleClick(bubble)}
              onHover={(hovered) => handleBubbleHover(hovered ? bubble.id : null)}
            />
          ))}
          
          {/* Axis labels */}
          {sceneReady && showAxes && (
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
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
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
      </Suspense>
    );
  } catch (error) {
    console.error('❌ Consolidated3DScene - Render error:', error);
    // Return a simple fallback mesh
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial color="#ef4444" wireframe />
      </mesh>
    );
  }
};

export default Consolidated3DScene;
