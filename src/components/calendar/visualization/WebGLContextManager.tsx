
import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WebGLContextManagerProps {
  children: React.ReactNode;
  onContextLost?: () => void;
  onContextRestored?: () => void;
  fallback?: React.ReactNode;
}

const WebGLContextManager: React.FC<WebGLContextManagerProps> = ({
  children,
  onContextLost,
  onContextRestored,
  fallback
}) => {
  const [contextLost, setContextLost] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<WebGLRenderingContext | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleContextLost = (event: WebGLContextEvent) => {
      console.warn('🔍 WebGL Context Lost');
      event.preventDefault();
      setContextLost(true);
      onContextLost?.();
    };

    const handleContextRestored = () => {
      console.log('🔍 WebGL Context Restored');
      setContextLost(false);
      setRetryCount(0);
      onContextRestored?.();
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [onContextLost, onContextRestored]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setContextLost(false);
  };

  if (contextLost || retryCount > 2) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              3D Visualization Error
            </h3>
            <p className="text-muted-foreground mb-4">
              WebGL context was lost. This can happen due to GPU driver issues or resource constraints.
            </p>
            {retryCount > 0 && (
              <p className="text-sm text-muted-foreground">
                Retry attempts: {retryCount}/3
              </p>
            )}
          </div>

          {retryCount <= 2 && (
            <Button
              onClick={handleRetry}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Canvas
      ref={canvasRef}
      gl={{ 
        antialias: true, 
        alpha: true,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance"
      }}
      onCreated={({ gl }) => {
        contextRef.current = gl.getContext();
        console.log('🔍 WebGL Context Created Successfully');
      }}
      onError={(error) => {
        console.error('🔍 Canvas Error:', error);
        setContextLost(true);
      }}
      className="h-full w-full"
    >
      {children}
    </Canvas>
  );
};

export default WebGLContextManager;
