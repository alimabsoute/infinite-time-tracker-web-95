
import React from 'react';
import { Line, Text } from '@react-three/drei';

interface Enhanced3DAxesProps {
  size?: number;
  showGrid?: boolean;
  showLabels?: boolean;
}

const Enhanced3DAxes: React.FC<Enhanced3DAxesProps> = ({ 
  size = 10, 
  showGrid = true, 
  showLabels = true 
}) => {
  // Axis lines
  const xAxisPoints: [number, number, number][] = [[-size, 0, 0], [size, 0, 0]];
  const yAxisPoints: [number, number, number][] = [[0, -size, 0], [0, size, 0]];
  const zAxisPoints: [number, number, number][] = [[0, 0, -size], [0, 0, size]];

  // Grid lines
  const gridLines = [];
  if (showGrid) {
    for (let i = -size; i <= size; i += 2) {
      // XZ plane grid
      gridLines.push(
        <Line key={`xz-${i}-1`} points={[[i, 0, -size], [i, 0, size]]} color="#333333" lineWidth={0.5} />,
        <Line key={`xz-${i}-2`} points={[[-size, 0, i], [size, 0, i]]} color="#333333" lineWidth={0.5} />
      );
    }
  }

  return (
    <group>
      {/* Main axis lines */}
      <Line points={xAxisPoints} color="#ef4444" lineWidth={3} />
      <Line points={yAxisPoints} color="#22c55e" lineWidth={3} />
      <Line points={zAxisPoints} color="#3b82f6" lineWidth={3} />
      
      {/* Grid */}
      {gridLines}
      
      {/* Axis arrows */}
      <mesh position={[size + 0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.2, 0.6, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, size + 0.5, 0]}>
        <coneGeometry args={[0.2, 0.6, 8]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      <mesh position={[0, 0, size + 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.2, 0.6, 8]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>

      {/* Enhanced axis labels */}
      {showLabels && (
        <>
          <Text
            position={[size + 1.5, -1, 0]}
            fontSize={0.6}
            color="#ef4444"
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter-medium.woff"
            outlineWidth={0.02}
            outlineColor="#ffffff"
          >
            Total Time (Hours)
          </Text>
          
          <Text
            position={[-1, size + 1.5, 0]}
            fontSize={0.6}
            color="#22c55e"
            anchorX="center"
            anchorY="middle"
            rotation={[0, 0, Math.PI / 2]}
            font="/fonts/inter-medium.woff"
            outlineWidth={0.02}
            outlineColor="#ffffff"
          >
            Avg Session (Min)
          </Text>
          
          <Text
            position={[0, -1, size + 1.5]}
            fontSize={0.6}
            color="#3b82f6"
            anchorX="center"
            anchorY="middle"
            rotation={[0, Math.PI / 2, 0]}
            font="/fonts/inter-medium.woff"
            outlineWidth={0.02}
            outlineColor="#ffffff"
          >
            Activity Distribution
          </Text>

          {/* Axis tick labels */}
          {Array.from({ length: 5 }, (_, i) => {
            const value = (i - 2) * (size / 2);
            return (
              <group key={`ticks-${i}`}>
                <Text
                  position={[value, -0.8, 0]}
                  fontSize={0.3}
                  color="#666666"
                  anchorX="center"
                  anchorY="middle"
                >
                  {Math.abs(value).toFixed(0)}h
                </Text>
                <Text
                  position={[-0.8, value, 0]}
                  fontSize={0.3}
                  color="#666666"
                  anchorX="center"
                  anchorY="middle"
                >
                  {Math.abs(value * 10).toFixed(0)}m
                </Text>
              </group>
            );
          })}
        </>
      )}
    </group>
  );
};

export default Enhanced3DAxes;
