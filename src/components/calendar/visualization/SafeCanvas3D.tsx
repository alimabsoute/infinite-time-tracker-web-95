
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
    powerPreference: "high-performance"
  }
}) => {
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState<boolean | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Simplified WebGL detection
  useEffect(() => {
    console.log('🔍 SafeCanvas3D - Starting WebGL detection');
    
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      
      if (context) {
        console.log('✅ SafeCanvas3D - WebGL supported');
        setIsWebGLSupported(true);
      } else {
        console.warn('❌ SafeCanvas3D - WebGL not supported');
        setIsWebGLSupported(false);
        setRenderError('WebGL not supported by this browser');
      }
    } catch (error) {
      console.error('❌ SafeCanvas3D - WebGL detection failed:', error);
      setIsWebGLSupported(false);
      setRenderError('WebGL initialization failed');
    }
  }, []);

  const handleCanvasCreated = (state: any) => {
    if (!mountedRef.current) return;
    
    try {
      console.log('✅ SafeCanvas3D - Canvas created successfully');
      console.log('🔍 SafeCanvas3D - Canvas state:', {
        gl: !!state.gl,
        scene: !!state.scene,
        camera: !!state.camera,
        size: state.size
      });
      
      onCreated?.(state);
    } catch (error) {
      console.error('❌ SafeCanvas3D - Canvas creation error:', error);
      setRenderError(`Canvas creation failed: ${error.message}`);
    }
  };

  const handleCanvasError = (error: any) => {
    if (!mountedRef.current) return;
    
    console.error('❌ SafeCanvas3D - Canvas error:', error);
    setRenderError(`Canvas error: ${error?.message || 'Unknown error'}`);
  };

  // Show fallback for unsupported WebGL or errors
  if (isWebGLSupported === false || renderError) {
    const errorFallback = fallback || (
      <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg border border-muted">
        <div className="text-center text-muted-foreground space-y-3 p-6">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <div>
            <p className="font-medium">3D Visualization Error</p>
            <p className="text-sm mt-1">
              {renderError || 'WebGL not supported'}
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

  // Show loading while detecting WebGL
  if (isWebGLSupported === null) {
    return (
      <div className={className} style={style}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm">Initializing 3D engine...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render Canvas with proper error handling
  try {
    console.log('🔍 SafeCanvas3D - Rendering Canvas');
    
    return (
      <div className={className} style={style}>
        <Canvas
          camera={camera}
          onCreated={handleCanvasCreated}
          onError={handleCanvasError}
          shadows={shadows}
          gl={gl}
          frameloop="always"
          dpr={[1, 2]}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </Canvas>
      </div>
    );
  } catch (error) {
    console.error('❌ SafeCanvas3D - Render error:', error);
    setRenderError(`Render error: ${error.message}`);
    return null;
  }
};

export default SafeCanvas3D;
