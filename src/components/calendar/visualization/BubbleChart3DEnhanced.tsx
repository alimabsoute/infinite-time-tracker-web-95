
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TimerSessionWithTimer } from "../../../types";
import SafeCanvas3D from './SafeCanvas3D';
import Safe3DScene from './Safe3DScene';
import { useBubbleDataProcessor, BubbleData } from './BubbleDataProcessor';

interface BubbleChart3DEnhancedProps {
  sessions: TimerSessionWithTimer[];
  startDate: Date;
  endDate: Date;
  onBubbleClick?: (bubble: BubbleData) => void;
  onError?: (error: Error) => void;
}

export const BubbleChart3DEnhanced: React.FC<BubbleChart3DEnhancedProps> = ({
  sessions,
  startDate,
  endDate,
  onBubbleClick,
  onError
}) => {
  const [renderState, setRenderState] = useState<'loading' | 'ready' | 'error' | 'fallback'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  console.log('🔍 BubbleChart3DEnhanced - Initializing with:', {
    sessionsCount: sessions.length,
    dateRange: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
  });

  // Process sessions into bubble data
  const bubbles = useBubbleDataProcessor({
    sessions,
    startDate,
    endDate,
    onError: (error) => {
      console.error('❌ BubbleChart3DEnhanced - Data processing error:', error);
      if (mountedRef.current) {
        setRenderState('error');
        setErrorMessage(error.message);
        onError?.(error);
      }
    }
  });

  // Timeout mechanism for fallback
  useEffect(() => {
    if (renderState === 'loading') {
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current && renderState === 'loading') {
          console.log('⏰ BubbleChart3DEnhanced - Loading timeout, switching to fallback');
          setRenderState('fallback');
          setErrorMessage('3D loading timeout');
          onError?.(new Error('3D visualization loading timeout'));
        }
      }, 5000); // Increased timeout to 5 seconds
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [renderState, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle successful Canvas creation
  const handleCanvasCreated = (state: any) => {
    if (mountedRef.current) {
      console.log('✅ BubbleChart3DEnhanced - Canvas created successfully');
      setRenderState('ready');
    }
  };

  // Handle Canvas errors
  const handleCanvasError = (error: Error) => {
    if (mountedRef.current) {
      console.error('❌ BubbleChart3DEnhanced - Canvas error:', error);
      setRenderState('fallback');
      setErrorMessage(error.message);
      onError?.(error);
    }
  };

  console.log('🔍 BubbleChart3DEnhanced - Current state:', {
    renderState,
    bubblesCount: bubbles?.length || 0,
    errorMessage
  });

  // Error state
  if (renderState === 'error' || renderState === 'fallback') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[400px] flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border"
      >
        <div className="text-center space-y-3">
          <p className="font-medium">3D Visualization Unavailable</p>
          <p className="text-sm">{errorMessage || 'Switching to 2D mode'}</p>
          <p className="text-xs">Sessions: {sessions.length} | Bubbles: {bubbles?.length || 0}</p>
        </div>
      </motion.div>
    );
  }

  // No data state
  if (!bubbles || bubbles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[400px] w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-900/20 rounded-lg flex items-center justify-center"
      >
        <div className="text-center text-foreground space-y-2">
          <p className="font-medium">No timer data available</p>
          <p className="text-sm text-muted-foreground">Create timers and log sessions to see the 3D visualization</p>
          <p className="text-xs text-muted-foreground">Sessions available: {sessions.length}</p>
        </div>
      </motion.div>
    );
  }

  try {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-[400px] w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/10 dark:to-slate-900/10 rounded-lg overflow-hidden relative"
      >
        {/* Loading overlay */}
        {renderState === 'loading' && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <div className="text-foreground text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm">Loading 3D visualization...</p>
              <p className="text-xs text-muted-foreground">Processing {bubbles.length} timers</p>
            </div>
          </div>
        )}
        
        <SafeCanvas3D
          camera={{ position: [0, 5, 15], fov: 50 }}
          onCreated={handleCanvasCreated}
          fallback={
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">3D rendering failed - fallback mode</p>
            </div>
          }
          gl={{ 
            preserveDrawingBuffer: true, 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
          }}
        >
          <Safe3DScene bubbles={bubbles} onBubbleClick={onBubbleClick} />
        </SafeCanvas3D>
        
        {/* Enhanced info panel */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border shadow-lg">
          <div className="text-foreground text-xs space-y-1">
            <div className="font-semibold mb-2">Enhanced 3D Bubble Chart</div>
            <div>• Bubble size = Total time logged</div>
            <div>• Position = Timeline distribution</div>
            <div>• Colors = Timer categories</div>
            <div className="text-muted-foreground mt-2">
              {bubbles.length} timers visualized
              {renderState === 'ready' && ' • 3D Ready'}
            </div>
          </div>
        </div>
      </motion.div>
    );
  } catch (error) {
    console.error('❌ BubbleChart3DEnhanced - Render error:', error);
    handleCanvasError(error as Error);
    return null;
  }
};

export default BubbleChart3DEnhanced;
