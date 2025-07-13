
import React, { useState, useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { TimerSessionWithTimer } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WebGLContextManager from './WebGLContextManager';

interface ConsolidatedNetworkGraph3DProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
  isStandalone?: boolean;
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
  sourcePos: [number, number, number];
  targetPos: [number, number, number];
}

const AnimatedNode = ({ node, isHovered, onHover }: { 
  node: NetworkNode; 
  isHovered: boolean;
  onHover: (node: NetworkNode | null) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && !isHovered) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[node.size, 16, 16]} />
        <meshLambertMaterial 
          color={node.color} 
          transparent 
          opacity={isHovered ? 0.9 : 0.8} 
        />
      </mesh>
      
      {isHovered && (
        <Html center distanceFactor={10}>
          <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 text-xs min-w-40 pointer-events-none shadow-lg">
            <div className="font-semibold text-foreground">{node.name}</div>
            <div className="text-muted-foreground">{node.category}</div>
            <div className="mt-2 space-y-1">
              <div className="text-foreground">{node.sessions} sessions</div>
              <div className="text-foreground">{(node.totalTime / (1000 * 60 * 60)).toFixed(1)}h total</div>
            </div>
          </div>
        </Html>
      )}
      
      <Text
        position={[0, -(node.size + 0.4), 0]}
        fontSize={0.15}
        color="hsl(var(--foreground))"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {node.name.slice(0, 12)}
      </Text>
    </group>
  );
};

const NetworkEdge = ({ edge }: { edge: NetworkEdge }) => {
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([
            ...edge.sourcePos,
            ...edge.targetPos
          ])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial 
        color="hsl(var(--muted-foreground))" 
        transparent 
        opacity={Math.max(0.15, Math.min(0.7, edge.strength * 0.8))}
      />
    </line>
  );
};

const Scene3D: React.FC<{ nodes: NetworkNode[]; edges: NetworkEdge[]; hoveredNode: NetworkNode | null; setHoveredNode: (node: NetworkNode | null) => void }> = ({
  nodes,
  edges,
  hoveredNode,
  setHoveredNode
}) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
      <pointLight position={[0, 10, -10]} intensity={0.4} />
      
      {edges.map((edge, index) => (
        <NetworkEdge key={`edge-${edge.source}-${edge.target}-${index}`} edge={edge} />
      ))}
      
      {nodes.map(node => (
        <AnimatedNode 
          key={node.id} 
          node={node} 
          isHovered={hoveredNode?.id === node.id}
          onHover={setHoveredNode}
        />
      ))}
      
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={6}
        maxDistance={25}
        autoRotate={!hoveredNode}
        autoRotateSpeed={0.3}
      />
    </>
  );
};

const ConsolidatedNetworkGraph3D: React.FC<ConsolidatedNetworkGraph3DProps> = ({ 
  sessions, 
  selectedCategory,
  isStandalone = false 
}) => {
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [webglError, setWebglError] = useState<string | null>(null);

  console.log('🔍 ConsolidatedNetworkGraph3D - Processing:', {
    sessionsCount: sessions.length,
    selectedCategory,
    isStandalone
  });

  const { nodes, edges } = useMemo(() => {
    try {
      // More lenient filtering - accept sessions with any duration > 0
      const validSessions = sessions.filter(session => {
        const hasDuration = session.duration_ms && session.duration_ms > 0;
        const hasTimer = session.timers && session.timer_id && session.timers.name;
        const matchesCategory = !selectedCategory || selectedCategory === 'all' || session.timers?.category === selectedCategory;
        
        return hasDuration && hasTimer && matchesCategory;
      });

      console.log('🔍 ConsolidatedNetworkGraph3D - Valid sessions:', validSessions.length);

      if (validSessions.length === 0) {
        return { nodes: [], edges: [] };
      }

      // Group sessions by timer
      const timerGroups: { [key: string]: TimerSessionWithTimer[] } = {};
      validSessions.forEach(session => {
        const timerId = session.timer_id;
        if (!timerGroups[timerId]) {
          timerGroups[timerId] = [];
        }
        timerGroups[timerId].push(session);
      });

      const timerEntries = Object.entries(timerGroups);
      console.log('🔍 ConsolidatedNetworkGraph3D - Timer groups:', timerEntries.length);

      if (timerEntries.length === 0) {
        return { nodes: [], edges: [] };
      }

      // Create nodes with proper 3D positioning
      const nodeList: NetworkNode[] = timerEntries.map(([timerId, timerSessions], index) => {
        const timer = timerSessions[0]?.timers;
        if (!timer) {
          console.warn('🔍 ConsolidatedNetworkGraph3D - Timer missing for ID:', timerId);
          return null;
        }

        const totalTime = timerSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
        const sessionCount = timerSessions.length;
        
        // Improved 3D positioning using spherical coordinates
        const totalNodes = timerEntries.length;
        const radius = Math.max(4, Math.min(8, totalNodes * 0.6));
        
        // Use spherical coordinates for better distribution
        const phi = Math.acos(1 - 2 * index / totalNodes); // Polar angle
        const theta = Math.PI * (1 + Math.sqrt(5)) * index; // Azimuthal angle (golden ratio)
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        // Validate position values
        const position: [number, number, number] = [
          isFinite(x) ? x : Math.random() * 4 - 2,
          isFinite(y) ? y : Math.random() * 4 - 2,
          isFinite(z) ? z : Math.random() * 4 - 2
        ];

        return {
          id: timerId,
          name: timer.name || 'Unnamed Timer',
          category: timer.category || 'Uncategorized',
          size: Math.max(0.3, Math.min(1.2, Math.log(sessionCount + 1) * 0.4)),
          position,
          color: `hsl(${(index * 137.5) % 360}, 65%, 55%)`,
          sessions: sessionCount,
          totalTime
        };
      }).filter(Boolean) as NetworkNode[];

      // Create edges based on category and usage patterns
      const edgeList: NetworkEdge[] = [];
      
      nodeList.forEach((nodeA, indexA) => {
        nodeList.forEach((nodeB, indexB) => {
          if (indexA < indexB) { // Avoid duplicate edges
            let strength = 0;
            
            // Same category gets higher strength
            if (nodeA.category === nodeB.category) {
              strength += 0.6;
            }
            
            // Similar session counts create connections
            const sessionRatio = Math.min(nodeA.sessions, nodeB.sessions) / 
                                Math.max(nodeA.sessions, nodeB.sessions);
            if (sessionRatio > 0.4) {
              strength += sessionRatio * 0.4;
            }
            
            // Only create edge if strength is significant
            if (strength > 0.5 && isFinite(strength)) {
              edgeList.push({
                source: nodeA.id,
                target: nodeB.id,
                strength: Math.min(1, strength),
                sourcePos: nodeA.position,
                targetPos: nodeB.position
              });
            }
          }
        });
      });

      console.log('🔍 ConsolidatedNetworkGraph3D - Created:', {
        nodes: nodeList.length,
        edges: edgeList.length
      });

      return { nodes: nodeList, edges: edgeList };
    } catch (error) {
      console.error('🔍 ConsolidatedNetworkGraph3D - Data processing error:', error);
      setWebglError('Failed to process network data');
      return { nodes: [], edges: [] };
    }
  }, [sessions, selectedCategory]);

  const handleContextLost = () => {
    setWebglError('WebGL context was lost');
  };

  const handleContextRestored = () => {
    setWebglError(null);
    setHoveredNode(null);
  };

  const fallbackContent = (
    <div className="h-full flex items-center justify-center">
      <div className="text-center text-muted-foreground space-y-2">
        <p className="font-medium">3D Visualization Unavailable</p>
        <p className="text-sm">WebGL is not supported or has encountered an error</p>
        <p className="text-xs">Sessions: {sessions.length}, Nodes: {nodes.length}</p>
      </div>
    </div>
  );

  if (webglError) {
    return (
      <div className={isStandalone ? "h-[400px]" : "h-full"}>
        <Card className="h-full flex items-center justify-center border-destructive/20 bg-destructive/5">
          <div className="text-center space-y-4 p-6">
            <div className="text-destructive font-medium">3D Network Error</div>
            <p className="text-sm text-muted-foreground">{webglError}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className={isStandalone ? "h-[400px]" : "h-full"}>
        <Card className="h-full flex items-center justify-center">
          <div className="text-center text-muted-foreground space-y-2">
            <p className="font-medium">No Network Data</p>
            <p className="text-sm">No timer relationships found for the selected period</p>
            <p className="text-xs">Sessions processed: {sessions.length}</p>
          </div>
        </Card>
      </div>
    );
  }

  const content = (
    <div className="h-full w-full border rounded-lg overflow-hidden bg-gradient-to-br from-background to-muted/20">
      <Suspense fallback={
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <WebGLContextManager
          onContextLost={handleContextLost}
          onContextRestored={handleContextRestored}
          fallback={fallbackContent}
        >
          <Scene3D 
            nodes={nodes}
            edges={edges}
            hoveredNode={hoveredNode}
            setHoveredNode={setHoveredNode}
          />
        </WebGLContextManager>
      </Suspense>
    </div>
  );

  if (isStandalone) {
    return (
      <Card className="h-[400px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Timer Network Graph</CardTitle>
          <p className="text-sm text-muted-foreground">
            3D network showing timer relationships • {nodes.length} timers, {edges.length} connections
          </p>
        </CardHeader>
        <CardContent className="h-full pb-4">
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
};

export default ConsolidatedNetworkGraph3D;
