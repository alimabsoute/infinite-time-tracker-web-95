
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setIsWebGLSupported(false);
        setCanvasError('WebGL is not supported in this browser');
      }
    } catch (error) {
      setIsWebGLSupported(false);
      setCanvasError('Failed to initialize WebGL');
    }
  }, []);

  const handleCanvasError = (error: any) => {
    console.error('🔍 SafeCanvas3D - Canvas error:', error);
    setCanvasError(error?.message || 'Canvas rendering error');
  };

  const handleCreated = (state: any) => {
    try {
      console.log('🔍 SafeCanvas3D - Canvas created successfully');
      if (state?.gl) {
        state.gl.setSize(state.gl.domElement.clientWidth, state.gl.domElement.clientHeight);
      }
      onCreated?.(state);
    } catch (error) {
      console.error('🔍 SafeCanvas3D - Canvas creation error:', error);
      handleCanvasError(error);
    }
  };

  if (!isWebGLSupported || canvasError) {
    const errorFallback = fallback || (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <p className="font-medium">3D Rendering Unavailable</p>
          <p className="text-sm">{canvasError || 'WebGL not supported'}</p>
        </div>
      </div>
    );

    return <div className={className} style={style}>{errorFallback}</div>;
  }

  try {
    return (
      <Canvas
        ref={canvasRef}
        camera={camera}
        style={style}
        className={className}
        onCreated={handleCreated}
        onError={handleCanvasError}
        shadows={shadows}
        gl={gl}
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    );
  } catch (error) {
    console.error('🔍 SafeCanvas3D - Render error:', error);
    handleCanvasError(error);
    return null;
  }
};

export default SafeCanvas3D;
