
import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { TimerSessionWithTimer } from '../../../types';
import AnimatedBubble from './BubbleAnimations';
import AxisSystem from './AxisSystem';
import { useBubbleMetrics } from './BubbleMetrics';
import ChartControls from './ChartControls';

interface Enhanced3DBubbleChartProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
  onBubbleClick?: (timer: any) => void;
}

const Enhanced3DBubbleChart: React.FC<Enhanced3DBubbleChartProps> = ({ 
  sessions, 
  selectedCategory, 
  onBubbleClick = () => {} 
}) => {
  const controlsRef = useRef<any>();
  const [cameraKey, setCameraKey] = useState(0);

  const bubbles = useBubbleMetrics({ sessions, selectedCategory });

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    setCameraKey(prev => prev + 1);
  };

  if (bubbles.length === 0) {
    return (
      <div className="h-[400px] w-full bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No timer data available for 3D visualization</p>
          <p className="text-sm mt-2">Create timers and log sessions to see the bubble chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[400px] w-full border border-gray-200 rounded-lg overflow-hidden">
      <Canvas 
        key={cameraKey}
        camera={{ position: [8, 6, 8], fov: 60 }}
        style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        <AxisSystem />
        
        {bubbles.map((bubble, index) => (
          <AnimatedBubble
            key={index}
            position={bubble.position}
            size={bubble.size}
            color={bubble.color}
            timer={bubble.timer}
            onClick={onBubbleClick}
          />
        ))}
        
        <OrbitControls
          ref={controlsRef}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>
      
      <ChartControls onResetCamera={resetCamera} />
    </div>
  );
};

export default Enhanced3DBubbleChart;
