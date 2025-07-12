
import React, { useState, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { TimerSessionWithTimer } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NetworkGraph3DProps {
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

const NetworkGraph3D: React.FC<NetworkGraph3DProps> = ({ sessions, selectedCategory }) => {
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const controlsRef = useRef<any>();

  const { nodes, edges } = useMemo(() => {
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

    // Create nodes
    const nodeList: NetworkNode[] = Object.entries(timerGroups).map(([timerId, timerSessions], index) => {
      const timer = timerSessions[0].timers;
      const totalTime = timerSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
      const sessionCount = timerSessions.length;
      
      // Position nodes in a 3D sphere
      const phi = Math.acos(-1 + (2 * index) / Object.keys(timerGroups).length);
      const theta = Math.sqrt(Object.keys(timerGroups).length * Math.PI) * phi;
      const radius = 5;
      
      return {
        id: timerId,
        name: timer?.name || 'Unknown Timer',
        category: timer?.category || 'Uncategorized',
        size: Math.max(0.3, Math.min(1.2, sessionCount / 10)),
        position: [
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi)
        ],
        color: `hsl(${(index * 137.5) % 360}, 60%, 65%)`,
        sessions: sessionCount,
        totalTime
      };
    });

    // Create edges based on category relationships
    const edgeList: NetworkEdge[] = [];
    nodeList.forEach(nodeA => {
      nodeList.forEach(nodeB => {
        if (nodeA.id !== nodeB.id && nodeA.category === nodeB.category) {
          const strength = Math.min(nodeA.sessions, nodeB.sessions) / Math.max(nodeA.sessions, nodeB.sessions);
          if (strength > 0.3) {
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
  }, [sessions, selectedCategory]);

  const Node = ({ node }: { node: NetworkNode }) => {
    return (
      <group position={node.position}>
        <mesh
          onPointerOver={() => setHoveredNode(node)}
          onPointerOut={() => setHoveredNode(null)}
        >
          <sphereGeometry args={[node.size, 16, 16]} />
          <meshLambertMaterial color={node.color} transparent opacity={0.8} />
        </mesh>
        
        {hoveredNode?.id === node.id && (
          <Html center>
            <div className="bg-background/90 backdrop-blur-sm border rounded-lg p-2 text-xs min-w-32">
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
          position={[0, -node.size - 0.3, 0]}
          fontSize={0.2}
          color="hsl(var(--foreground))"
          anchorX="center"
          anchorY="middle"
        >
          {node.name}
        </Text>
      </group>
    );
  };

  const Edge = ({ edge }: { edge: NetworkEdge }) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return null;

    const points = [sourceNode.position, targetNode.position];
    
    return (
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              ...sourceNode.position,
              ...targetNode.position
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          color="hsl(var(--muted-foreground))" 
          transparent 
          opacity={edge.strength * 0.5}
        />
      </line>
    );
  };

  if (nodes.length === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No data available for network visualization</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle className="text-lg">Timer Network</CardTitle>
        <p className="text-sm text-muted-foreground">3D relationship visualization</p>
      </CardHeader>
      <CardContent className="h-full">
        <div className="h-full border rounded-lg overflow-hidden">
          <Canvas camera={{ position: [8, 6, 8], fov: 60 }}>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkGraph3D;
