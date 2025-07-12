
import React, { useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
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

const LoadingFallback: React.FC = () => (
  <Html center>
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  </Html>
);

const Enhanced3DBubbleChart: React.FC<Enhanced3DBubbleChartProps> = ({ 
  sessions, 
  selectedCategory, 
  onBubbleClick = () => {} 
}) => {
  const controlsRef = useRef<any>();
  const [cameraKey, setCameraKey] = useState(0);
  const [canvasError, setCanvasError] = useState<string | null>(null);

  console.log('🔍 Enhanced3DBubbleChart - Rendering with:', {
    sessionsCount: sessions.length,
    selectedCategory
  });

  const bubbles = useBubbleMetrics({ sessions, selectedCategory });

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    setCameraKey(prev => prev + 1);
  };

  const handleCanvasError = (error: any) => {
    console.error('🔍 Enhanced3DBubbleChart - Canvas error:', error);
    setCanvasError('Failed to initialize 3D canvas. Please try refreshing the page.');
  };

  if (canvasError) {
    return (
      <div className="h-[400px] w-full bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
        <div className="text-center text-red-600">
          <p className="font-medium">3D Visualization Error</p>
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

  if (bubbles.length === 0) {
    return (
      <div className="h-[400px] w-full bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No timer data available for 3D visualization</p>
          <p className="text-sm mt-2">Create timers and log sessions to see the bubble chart</p>
          <p className="text-xs mt-2 text-gray-400">
            Sessions: {sessions.length} | Category: {selectedCategory || 'all'}
          </p>
        </div>
      </div>
    );
  }

  console.log('🔍 Enhanced3DBubbleChart - Rendering canvas with', bubbles.length, 'bubbles');

  return (
    <div className="relative w-full border border-gray-200 rounded-lg overflow-hidden" style={{ height: '400px' }}>
      <Canvas 
        key={cameraKey}
        camera={{ position: [8, 6, 8], fov: 60 }}
        style={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          width: '100%',
          height: '100%'
        }}
        onError={handleCanvasError}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
          
          <AxisSystem />
          
          {bubbles.map((bubble, index) => (
            <AnimatedBubble
              key={`bubble-${index}-${bubble.timer.timerId || index}`}
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
            minDistance={3}
            maxDistance={20}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
      
      <ChartControls onResetCamera={resetCamera} />
    </div>
  );
};

export default Enhanced3DBubbleChart;
