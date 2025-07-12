
import React, { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { TimerSessionWithTimer } from '../../../types';

interface EnhancedNetworkGraph3DProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
}

interface NetworkNode {
  id: string;
  name: string;
  category: string;
  size: number;
  position: [number, number, number];
  color: string;
  sessions: number;
  totalTime: number;
}

interface NetworkEdge {
  source: string;
  target: string;
  strength: number;
}

const EnhancedNetworkGraph3D: React.FC<EnhancedNetworkGraph3DProps> = ({ sessions, selectedCategory }) => {
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [canvasError, setCanvasError] = useState<string | null>(null);
  const controlsRef = useRef<any>();

  const { nodes, edges } = useMemo(() => {
    try {
      const filteredSessions = sessions.filter(session => 
        session.duration_ms && 
        session.timers &&
        (!selectedCategory || selectedCategory === 'all' || session.timers.category === selectedCategory)
      );

      // Group sessions by timer
      const timerGroups: { [key: string]: TimerSessionWithTimer[] } = {};
      filteredSessions.forEach(session => {
        const timerId = session.timer_id;
        if (!timerGroups[timerId]) {
          timerGroups[timerId] = [];
        }
        timerGroups[timerId].push(session);
      });

      // Create nodes with safe property access
      const nodeList: NetworkNode[] = Object.entries(timerGroups).map(([timerId, timerSessions], index) => {
        const timer = timerSessions[0]?.timers;
        const totalTime = timerSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
        const sessionCount = timerSessions.length;
        
        // Position nodes in a 3D sphere with bounds checking
        const totalNodes = Object.keys(timerGroups).length;
        const phi = Math.acos(-1 + (2 * index) / Math.max(totalNodes, 1));
        const theta = Math.sqrt(Math.max(totalNodes, 1) * Math.PI) * phi;
        const radius = 5;
        
        // Ensure all trigonometric values are finite
        const cosTheta = isFinite(Math.cos(theta)) ? Math.cos(theta) : 0;
        const sinTheta = isFinite(Math.sin(theta)) ? Math.sin(theta) : 0;
        const cosPhi = isFinite(Math.cos(phi)) ? Math.cos(phi) : 0;
        const sinPhi = isFinite(Math.sin(phi)) ? Math.sin(phi) : 1;
        
        return {
          id: timerId,
          name: timer?.name || 'Unknown Timer',
          category: timer?.category || 'Uncategorized',
          size: Math.max(0.3, Math.min(1.2, sessionCount / 10)),
          position: [
            radius * cosTheta * sinPhi,
            radius * sinTheta * sinPhi,
            radius * cosPhi
          ] as [number, number, number],
          color: `hsl(${(index * 137.5) % 360}, 60%, 65%)`,
          sessions: sessionCount,
          totalTime
        };
      });

      // Create edges based on category relationships with validation
      const edgeList: NetworkEdge[] = [];
      nodeList.forEach(nodeA => {
        nodeList.forEach(nodeB => {
          if (nodeA.id !== nodeB.id && nodeA.category === nodeB.category && nodeA.sessions > 0 && nodeB.sessions > 0) {
            const strength = Math.min(nodeA.sessions, nodeB.sessions) / Math.max(nodeA.sessions, nodeB.sessions);
            if (strength > 0.3 && isFinite(strength)) {
              edgeList.push({
                source: nodeA.id,
                target: nodeB.id,
                strength
              });
            }
          }
        });
      });

      return { nodes: nodeList, edges: edgeList };
    } catch (error) {
      console.error('Error processing network data:', error);
      return { nodes: [], edges: [] };
    }
  }, [sessions, selectedCategory]);

  const Node = ({ node }: { node: NetworkNode }) => {
    // Validate position array
    const safePosition = node.position.every(coord => isFinite(coord)) 
      ? node.position 
      : [0, 0, 0] as [number, number, number];

    return (
      <group position={safePosition}>
        <mesh
          onPointerOver={() => setHoveredNode(node)}
          onPointerOut={() => setHoveredNode(null)}
        >
          <sphereGeometry args={[Math.max(0.1, node.size), 16, 16]} />
          <meshLambertMaterial color={node.color} transparent opacity={0.8} />
        </mesh>
        
        {hoveredNode?.id === node.id && (
          <Html center>
            <div className="bg-background/90 backdrop-blur-sm border rounded-lg p-2 text-xs min-w-32 pointer-events-none">
              <div className="font-semibold">{node.name}</div>
              <div className="text-muted-foreground">{node.category}</div>
              <div className="mt-1">
                <div>{node.sessions} sessions</div>
                <div>{(node.totalTime / (1000 * 60 * 60)).toFixed(1)}h total</div>
              </div>
            </div>
          </Html>
        )}
        
        <Text
          position={[0, -(Math.max(0.1, node.size) + 0.3), 0]}
          fontSize={0.2}
          color="hsl(var(--foreground))"
          anchorX="center"
          anchorY="middle"
        >
          {node.name.slice(0, 10)}
        </Text>
      </group>
    );
  };

  const Edge = ({ edge }: { edge: NetworkEdge }) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return null;

    // Validate positions before creating edge
    const sourcePos = sourceNode.position.every(coord => isFinite(coord)) ? sourceNode.position : [0, 0, 0];
    const targetPos = targetNode.position.every(coord => isFinite(coord)) ? targetNode.position : [0, 0, 0];
    
    return (
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              ...sourcePos,
              ...targetPos
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          color="hsl(var(--muted-foreground))" 
          transparent 
          opacity={Math.max(0.1, Math.min(0.8, edge.strength * 0.5))}
        />
      </line>
    );
  };

  const handleCanvasError = (error: any) => {
    console.error('Network 3D Canvas error:', error);
    setCanvasError('Failed to initialize 3D network visualization');
  };

  if (canvasError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="font-medium">3D Network Error</p>
          <p className="text-sm mt-2">{canvasError}</p>
          <button 
            onClick={() => setCanvasError(null)}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No data available for network visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full border rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Suspense fallback={
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <Canvas 
          camera={{ position: [8, 6, 8], fov: 60 }}
          onError={handleCanvasError}
          gl={{ antialias: true, alpha: true }}
          className="h-full w-full"
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
          
          {edges.map((edge, index) => (
            <Edge key={`edge-${index}`} edge={edge} />
          ))}
          
          {nodes.map(node => (
            <Node key={node.id} node={node} />
          ))}
          
          <OrbitControls
            ref={controlsRef}
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={20}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default EnhancedNetworkGraph3D;
