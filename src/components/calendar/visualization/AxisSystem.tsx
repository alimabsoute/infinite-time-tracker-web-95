
import React from 'react';
import { Line, Text } from '@react-three/drei';

const AxisSystem: React.FC = () => {
  const xAxisPoints: [number, number, number][] = [[-6, 0, 0], [6, 0, 0]];
  const yAxisPoints: [number, number, number][] = [[0, -4, 0], [0, 4, 0]];
  const zAxisPoints: [number, number, number][] = [[0, 0, -4], [0, 0, 4]];

  return (
    <>
      {/* Axis lines */}
      <Line points={xAxisPoints} color="#ef4444" lineWidth={2} />
      <Line points={yAxisPoints} color="#22c55e" lineWidth={2} />
      <Line points={zAxisPoints} color="#3b82f6" lineWidth={2} />
      
      {/* Axis arrows */}
      <mesh position={[6.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 4.5, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      <mesh position={[0, 0, 4.5]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>

      {/* Simplified axis labels without font dependencies */}
      <Text
        position={[7, -0.5, 0]}
        fontSize={0.4}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        Total Time
      </Text>
      
      <Text
        position={[-0.5, 5, 0]}
        fontSize={0.4}
        color="#374151"
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, Math.PI / 2]}
      >
        Avg Session
      </Text>
      
      <Text
        position={[0, -0.5, 5]}
        fontSize={0.4}
        color="#374151"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI / 2, 0]}
      >
        Distribution
      </Text>
    </>
  );
};

export default AxisSystem;
