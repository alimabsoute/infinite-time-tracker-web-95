
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { TimerSessionWithTimer } from "../../../types";
import { useBubbleDataProcessor, BubbleData } from './BubbleDataProcessor';
import Consolidated3DScene from './Consolidated3DScene';

interface Robust3DContainerProps {
  sessions: TimerSessionWithTimer[];
  startDate: Date;
  endDate: Date;
  onBubbleClick?: (bubble: BubbleData) => void;
  selectedCategory?: string;
}

type RenderState = 'initializing' | 'loading' | 'ready' | 'error' | 'fallback';

export const Robust3DContainer: React.FC<Robust3DContainerProps> = ({
  sessions,
  startDate,
  endDate,
  onBubbleClick,
  selectedCategory
}) => {
  const [renderState, setRenderState] = useState<RenderState>('initializing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [autoRotate, setAutoRotate] = useState(false);
  const [showAxes, setShowAxes] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);
  const initRef = useRef(false);

  console.log('🔍 Robust3DContainer - Initializing with:', {
    sessionsCount: sessions.length,
    dateRange: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
    renderState
  });

  // Process sessions into bubble data
  const bubbles = useBubbleDataProcessor({
    sessions,
    startDate,
    endDate,
    onError: (error) => {
      console.error('❌ Robust3DContainer - Data processing error:', error);
      if (mountedRef.current) {
        setRenderState('error');
        setErrorMessage(`Data processing failed: ${error.message}`);
      }
    }
  });

  // WebGL capability check
  const checkWebGLSupport = () => {
    console.log('🔍 Robust3DContainer - Checking WebGL support');
    
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      
      if (!context) {
        throw new Error('WebGL not supported');
      }
      
      // Test basic WebGL functionality
      const renderer = context.getParameter(context.RENDERER);
      const vendor = context.getParameter(context.VENDOR);
      
      console.log('✅ Robust3DContainer - WebGL supported:', { renderer, vendor });
      return true;
    } catch (error) {
      console.error('❌ Robust3DContainer - WebGL check failed:', error);
      return false;
    }
  };

  // Initialize 3D environment
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    
    console.log('🔍 Robust3DContainer - Initializing 3D environment');
    
    // Check WebGL support
    if (!checkWebGLSupport()) {
      setRenderState('fallback');
      setErrorMessage('WebGL not supported by this browser');
      return;
    }
    
    // Set loading state
    setRenderState('loading');
    
    // Set timeout for fallback
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current && renderState === 'loading') {
        console.log('⏰ Robust3DContainer - Loading timeout, switching to fallback');
        setRenderState('fallback');
        setErrorMessage('3D initialization timeout');
      }
    }, 8000);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
    if (!mountedRef.current) return;
    
    try {
      console.log('✅ Robust3DContainer - Canvas created successfully');
      console.log('🔍 Robust3DContainer - Canvas state:', {
        gl: !!state.gl,
        scene: !!state.scene,
        camera: !!state.camera,
        size: state.size
      });
      
      setRenderState('ready');
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } catch (error) {
      console.error('❌ Robust3DContainer - Canvas creation error:', error);
      setRenderState('error');
      setErrorMessage(`Canvas initialization failed: ${error.message}`);
    }
  };

  // Handle Canvas errors
  const handleCanvasError = (error: any) => {
    if (!mountedRef.current) return;
    
    console.error('❌ Robust3DContainer - Canvas error:', error);
    setRenderState('fallback');
    setErrorMessage(`3D rendering failed: ${error?.message || 'Unknown error'}`);
  };

  console.log('🔍 Robust3DContainer - Current state:', {
    renderState,
    bubblesCount: bubbles?.length || 0,
    errorMessage,
    hasValidData: bubbles && bubbles.length > 0
  });

  // Loading state
  if (renderState === 'initializing' || renderState === 'loading') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[400px] w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-900/20 rounded-lg flex items-center justify-center"
      >
        <div className="text-center text-foreground space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="font-medium">
            {renderState === 'initializing' ? 'Initializing 3D Engine...' : 'Loading 3D Visualization...'}
          </p>
          <p className="text-sm text-muted-foreground">
            Processing {sessions.length} sessions into {bubbles?.length || 0} timer bubbles
          </p>
          <p className="text-xs text-muted-foreground">
            This may take a few moments on slower devices
          </p>
        </div>
      </motion.div>
    );
  }

  // Error or fallback state
  if (renderState === 'error' || renderState === 'fallback') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[400px] flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border"
      >
        <div className="text-center space-y-4 p-6">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <div>
            <p className="font-medium text-foreground mb-2">3D Visualization Unavailable</p>
            <p className="text-sm text-muted-foreground mb-2">{errorMessage}</p>
            <p className="text-xs text-muted-foreground">
              Sessions: {sessions.length} | Processed: {bubbles?.length || 0} timers
            </p>
          </div>
          <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded">
            <p className="font-medium mb-1">Try these solutions:</p>
            <ul className="text-left space-y-1">
              <li>• Update your browser to the latest version</li>
              <li>• Enable hardware acceleration in browser settings</li>
              <li>• Switch to a different visualization mode</li>
            </ul>
          </div>
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
          <p className="text-xs text-muted-foreground">
            Date range: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground">Sessions processed: {sessions.length}</p>
        </div>
      </motion.div>
    );
  }

  // Ready state - render 3D scene
  try {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-[400px] w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/10 dark:to-slate-900/10 rounded-lg overflow-hidden relative"
      >
        <Canvas
          camera={{ position: [15, 10, 15], fov: 60 }}
          onCreated={handleCanvasCreated}
          onError={handleCanvasError}
          shadows={true}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: false
          }}
          style={{ background: 'transparent' }}
          frameloop="always"
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <Consolidated3DScene 
              bubbles={bubbles}
              onBubbleClick={onBubbleClick}
              autoRotate={autoRotate}
              showAxes={showAxes}
              showGrid={showGrid}
            />
          </Suspense>
        </Canvas>
        
        {/* Enhanced control panel */}
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
          <div className="flex flex-col gap-2 text-xs">
            <div className="font-semibold mb-1">3D Controls</div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
                className="w-3 h-3"
              />
              Auto Rotate
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAxes}
                onChange={(e) => setShowAxes(e.target.checked)}
                className="w-3 h-3"
              />
              Show Axes
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-3 h-3"
              />
              Show Grid
            </label>
          </div>
        </div>
        
        {/* Enhanced legend */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
          <div className="text-xs space-y-1">
            <div className="font-semibold mb-2">3D Timer Visualization ({bubbles.length} timers)</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Running ({bubbles.filter(d => d.isRunning).length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Stopped ({bubbles.filter(d => !d.isRunning).length})</span>
            </div>
            <div className="text-muted-foreground mt-2 text-xs">
              • Size = Sessions + Time logged<br/>
              • X-axis = Total Time<br/>
              • Y-axis = Average Session<br/>
              • Z-axis = Activity Distribution
            </div>
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">3D Ready</span>
          </div>
        </div>
      </motion.div>
    );
  } catch (error) {
    console.error('❌ Robust3DContainer - Final render error:', error);
    return (
      <div className="h-[400px] flex items-center justify-center text-red-500 bg-red-50 rounded-lg border border-red-200">
        <p>Critical 3D rendering error occurred</p>
      </div>
    );
  }
};

export default Robust3DContainer;
