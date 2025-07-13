
import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { AlertTriangle } from 'lucide-react';

interface SafeCanvas3DProps {
  children: React.ReactNode;
  camera?: any;
  style?: React.CSSProperties;
  className?: string;
  onCreated?: (state: any) => void;
  fallback?: React.ReactNode;
  shadows?: boolean;
  gl?: any;
}

const SafeCanvas3D: React.FC<SafeCanvas3DProps> = ({
  children,
  camera = { position: [0, 5, 15], fov: 50 },
  style,
  className,
  onCreated,
  fallback,
  shadows = false,
  gl = { 
    antialias: true, 
    alpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: false
  }
}) => {
  const [canvasError, setCanvasError] = useState<string | null>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Enhanced WebGL support check
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        console.warn('🔍 SafeCanvas3D - WebGL not supported');
        setIsWebGLSupported(false);
        setCanvasError('WebGL is not supported in this browser');
        return;
      }

      // Test for essential WebGL features
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        console.log('🔍 SafeCanvas3D - GPU:', gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }

      setIsReady(true);
    } catch (error) {
      console.error('🔍 SafeCanvas3D - WebGL initialization error:', error);
      setIsWebGLSupported(false);
      setCanvasError('Failed to initialize WebGL context');
    }
  }, []);

  const handleCanvasError = (error: any) => {
    if (!mounted.current) return;
    
    console.error('🔍 SafeCanvas3D - Canvas error:', error);
    const errorMessage = error?.message || error?.toString() || 'Canvas rendering error';
    setCanvasError(errorMessage);
  };

  const handleCreated = (state: any) => {
    if (!mounted.current) return;
    
    try {
      console.log('🔍 SafeCanvas3D - Canvas created successfully');
      
      // Safely access and configure the renderer
      if (state?.gl && typeof state.gl.setSize === 'function') {
        const { clientWidth, clientHeight } = state.gl.domElement;
        if (clientWidth > 0 && clientHeight > 0) {
          state.gl.setSize(clientWidth, clientHeight);
        }
      }
      
      // Safely call user's onCreated callback
      if (onCreated && typeof onCreated === 'function') {
        onCreated(state);
      }
    } catch (error) {
      console.error('🔍 SafeCanvas3D - Canvas creation error:', error);
      handleCanvasError(error);
    }
  };

  // Enhanced error fallback
  if (!isWebGLSupported || canvasError || !isReady) {
    const errorFallback = fallback || (
      <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg border border-muted">
        <div className="text-center text-muted-foreground space-y-3 p-6">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <div>
            <p className="font-medium">3D Rendering Unavailable</p>
            <p className="text-sm mt-1">
              {canvasError || (!isReady ? 'Initializing WebGL...' : 'WebGL not supported')}
            </p>
            <p className="text-xs mt-2 text-muted-foreground/60">
              Falling back to 2D visualization
            </p>
          </div>
        </div>
      </div>
    );

    return <div className={className} style={style}>{errorFallback}</div>;
  }

  // Enhanced Canvas with better error handling
  try {
    return (
      <div className={className} style={style}>
        <Canvas
          ref={canvasRef}
          camera={camera}
          onCreated={handleCreated}
          onError={handleCanvasError}
          shadows={shadows}
          gl={{
            ...gl,
            // Ensure safe defaults
            antialias: gl.antialias !== false,
            alpha: gl.alpha !== false,
            powerPreference: gl.powerPreference || "default"
          }}
          // Add frame loop mode to prevent unnecessary renders
          frameloop="demand"
          // Disable pixel ratio for better performance
          dpr={[1, 1.5]}
        >
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </Canvas>
      </div>
    );
  } catch (error) {
    console.error('🔍 SafeCanvas3D - Render error:', error);
    handleCanvasError(error);
    return null;
  }
};

export default SafeCanvas3D;
