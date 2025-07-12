
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { TimerSessionWithTimer } from "../../../types";
import Safe3DScene from './Safe3DScene';
import { useBubbleDataProcessor } from './BubbleDataProcessor';

interface BubbleData {
  id: string;
  position: [number, number, number];
  size: number;
  color: string;
  timerName: string;
  totalTime: number;
  sessionCount: number;
  creationDate: Date;
  category: string;
}

interface BubbleChart3DEnhancedProps {
  sessions: TimerSessionWithTimer[];
  currentWeekStart: Date;
  onBubbleClick?: (bubble: BubbleData) => void;
  onError?: (error: Error) => void;
}

export const BubbleChart3DEnhanced: React.FC<BubbleChart3DEnhancedProps> = ({
  sessions,
  currentWeekStart,
  onBubbleClick,
  onError
}) => {
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  // Process sessions into bubble data with enhanced validation
  const bubbles = useBubbleDataProcessor({
    sessions,
    currentWeekStart,
    onError: (error) => {
      console.error('🔍 BubbleChart3DEnhanced - Data processing error:', error);
      if (mountedRef.current) {
        setRenderError(error.message);
        onError?.(error);
      }
    }
  });

  // Timeout mechanism - fallback after 3 seconds if 3D doesn't load
  useEffect(() => {
    if (isLoading) {
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current && isLoading) {
          console.log('🔍 BubbleChart3DEnhanced - 3D loading timeout, triggering fallback');
          setRenderError('3D visualization loading timeout');
          onError?.(new Error('3D visualization loading timeout - falling back to 2D'));
        }
      }, 3000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle Canvas creation success
  const handleCanvasCreated = ({ gl }: any) => {
    if (mountedRef.current) {
      console.log('🔍 BubbleChart3DEnhanced - Canvas created successfully');
      setIsLoading(false);
      gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight);
    }
  };

  // Handle Canvas errors
  const handleCanvasError = (error: Error) => {
    if (mountedRef.current) {
      console.error('🔍 BubbleChart3DEnhanced - Canvas error:', error);
      setRenderError(error.message);
      setIsLoading(false);
      onError?.(error);
    }
  };

  if (renderError) {
    return (
      <div className="h-[400px] flex items-center justify-center text-red-500 bg-red-50/50 rounded-lg">
        <div className="text-center">
          <p className="font-medium">3D Rendering Failed</p>
          <p className="text-sm mt-2">{renderError}</p>
          <p className="text-xs mt-2 text-red-400">Switching to 2D visualization...</p>
        </div>
      </div>
    );
  }

  if (!bubbles || bubbles.length === 0) {
    return (
      <div className="h-[400px] w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <p>No timer data available for 3D visualization</p>
          <p className="text-sm mt-2 text-slate-300">Create timers and log sessions to see the bubble chart</p>
          <p className="text-xs mt-4 text-slate-400">Sessions available: {sessions.length}</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-[400px] w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden relative"
      >
        {isLoading && (
          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm">Loading 3D visualization...</p>
            </div>
          </div>
        )}
        
        <Canvas
          camera={{ position: [0, 5, 15], fov: 50 }}
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
          onCreated={handleCanvasCreated}
          onError={handleCanvasError}
          gl={{ 
            preserveDrawingBuffer: true, 
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
          }}
        >
          <Safe3DScene bubbles={bubbles} onBubbleClick={onBubbleClick} />
        </Canvas>
        
        {/* Enhanced legend */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
          <div className="text-white text-xs space-y-1">
            <div className="font-semibold mb-2">3D Bubble Chart</div>
            <div>• Size = Total time logged</div>
            <div>• Position = Creation timeline</div>
            <div>• Colors = Categories</div>
            <div className="text-slate-300 mt-2">{bubbles.length} timers visualized</div>
          </div>
        </div>
      </motion.div>
    );
  } catch (error) {
    console.error('🔍 BubbleChart3DEnhanced - Render error:', error);
    handleCanvasError(error as Error);
    return null;
  }
};

export default BubbleChart3DEnhanced;
