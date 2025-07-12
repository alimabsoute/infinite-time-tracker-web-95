
import React, { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { TimerSessionWithTimer } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProcessedTimerColors } from '../../../utils/timerColorProcessor';

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

interface EnhancedNetworkGraph3DProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
}

const NetworkNode = ({ node, isHovered, onHover }: { 
  node: NetworkNode; 
  isHovered: boolean;
  onHover: (nodeId: string | null) => void;
}) => {
  if (!node.position.every(coord => isFinite(coord))) {
    console.warn('Invalid node position:', node.position);
    return null;
  }

  return (
    <group position={node.position}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node.id);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[Math.max(0.1, node.size), 16, 16]} />
        <meshLambertMaterial 
          color={node.color} 
          transparent 
          opacity={isHovered ? 0.9 : 0.7} 
        />
      </mesh>
      
      {isHovered && (
        <Html center>
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 text-xs min-w-32 pointer-events-none shadow-lg">
            <div className="font-semibold text-foreground">{node.name}</div>
            <div className="text-muted-foreground">{node.category}</div>
            <div className="mt-1 space-y-1">
              <div>{node.sessions} sessions</div>
              <div>{(node.totalTime / (1000 * 60 * 60)).toFixed(1)}h total</div>
            </div>
          </div>
        </Html>
      )}
      
      <Text
        position={[0, -(Math.max(0.1, node.size) + 0.3), 0]}
        fontSize={0.15}
        color="hsl(var(--foreground))"
        anchorX="center"
        anchorY="middle"
      >
        {node.name.slice(0, 8)}
      </Text>
    </group>
  );
};

const NetworkEdge = ({ edge, nodes }: { edge: NetworkEdge; nodes: NetworkNode[] }) => {
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);
  
  if (!sourceNode || !targetNode) return null;

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
        opacity={Math.max(0.1, Math.min(0.6, edge.strength * 0.8))}
      />
    </line>
  );
};

const EnhancedNetworkGraph3D: React.FC<EnhancedNetworkGraph3DProps> = ({ sessions, selectedCategory }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [canvasError, setCanvasError] = useState<string | null>(null);
  const controlsRef = useRef<any>();

  const { nodes, edges } = useMemo(() => {
    try {
      const filteredSessions = sessions.filter(session => 
        session.duration_ms && 
        session.timers &&
        (!selectedCategory || selectedCategory === 'all' || session.timers.category === selectedCategory)
      );

      if (filteredSessions.length === 0) {
        return { nodes: [], edges: [] };
      }

      // Group sessions by timer
      const timerGroups: { [key: string]: TimerSessionWithTimer[] } = {};
      filteredSessions.forEach(session => {
        const timerId = session.timer_id;
        if (!timerGroups[timerId]) {
          timerGroups[timerId] = [];
        }
        timerGroups[timerId].push(session);
      });

      // Create nodes with enhanced validation
      const nodeList: NetworkNode[] = Object.entries(timerGroups).map(([timerId, timerSessions], index) => {
        const timer = timerSessions[0]?.timers;
        const totalTime = timerSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
        const sessionCount = timerSessions.length;
        
        // Safe 3D positioning
        const totalNodes = Object.keys(timerGroups).length;
        const phi = Math.acos(-1 + (2 * index) / Math.max(totalNodes, 1));
        const theta = Math.sqrt(Math.max(totalNodes, 1) * Math.PI) * phi;
        const radius = 4;
        
        const cosTheta = isFinite(Math.cos(theta)) ? Math.cos(theta) : 0;
        const sinTheta = isFinite(Math.sin(theta)) ? Math.sin(theta) : 0;
        const cosPhi = isFinite(Math.cos(phi)) ? Math.cos(phi) : 0;
        const sinPhi = isFinite(Math.sin(phi)) ? Math.sin(phi) : 1;
        
        const colors = getProcessedTimerColors(timerId);
        
        return {
          id: timerId,
          name: timer?.name || 'Unknown Timer',
          category: timer?.category || 'Uncategorized',
          size: Math.max(0.2, Math.min(0.8, sessionCount / 15)),
          position: [
            radius * cosTheta * sinPhi,
            radius * sinTheta * sinPhi,
            radius * cosPhi
          ] as [number, number, number],
          color: colors.primaryBorder,
          sessions: sessionCount,
          totalTime
        };
      });

      // Create edges based on category relationships
      const edgeList: NetworkEdge[] = [];
      nodeList.forEach(nodeA => {
        nodeList.forEach(nodeB => {
          if (nodeA.id !== nodeB.id && 
              nodeA.category === nodeB.category && 
              nodeA.sessions > 2 && 
              nodeB.sessions > 2) {
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

  const handleCanvasError = (error: any) => {
    console.error('Enhanced Network 3D Canvas error:', error);
    setCanvasError('Failed to initialize 3D network visualization. Your browser may not support WebGL.');
  };

  if (canvasError) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
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
      </Card>
    );
  }

  if (nodes.length === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Insufficient data for network visualization</p>
          <p className="text-sm mt-2">Need multiple timers with several sessions each</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Enhanced Timer Network</CardTitle>
        <p className="text-sm text-muted-foreground">3D relationship visualization with error handling</p>
      </CardHeader>
      <CardContent className="h-full">
        <div className="h-full border rounded-lg overflow-hidden">
          <Suspense fallback={
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }>
            <Canvas 
              camera={{ position: [6, 4, 6], fov: 60 }}
              onError={handleCanvasError}
              gl={{ 
                antialias: true, 
                alpha: true,
                powerPreference: "high-performance",
                failIfMajorPerformanceCaveat: false
              }}
            >
              <ambientLight intensity={0.5} />
              <pointLight position={[8, 8, 8]} intensity={0.7} />
              <pointLight position={[-8, -8, -8]} intensity={0.3} />
              
              {edges.map((edge, index) => (
                <NetworkEdge key={`edge-${index}`} edge={edge} nodes={nodes} />
              ))}
              
              {nodes.map(node => (
                <NetworkNode
                  key={node.id}
                  node={node}
                  isHovered={hoveredNode === node.id}
                  onHover={setHoveredNode}
                />
              ))}
              
              <OrbitControls
                ref={controlsRef}
                enableZoom={true}
                enablePan={true}
                enableRotate={true}
                minDistance={3}
                maxDistance={15}
                maxPolarAngle={Math.PI}
                minPolarAngle={0}
              />
            </Canvas>
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedNetworkGraph3D;
