
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Enhanced3DCameraProps {
  autoRotate?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  minDistance?: number;
  maxDistance?: number;
  onCameraChange?: (position: THREE.Vector3) => void;
}

const Enhanced3DCamera: React.FC<Enhanced3DCameraProps> = ({
  autoRotate = false,
  enableZoom = true,
  enablePan = true,
  minDistance = 8,
  maxDistance = 30,
  onCameraChange
}) => {
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (controlsRef.current && onCameraChange) {
      onCameraChange(controlsRef.current.object.position);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={enablePan}
      enableZoom={enableZoom}
      enableRotate={true}
      autoRotate={autoRotate}
      autoRotateSpeed={0.5}
      minDistance={minDistance}
      maxDistance={maxDistance}
      target={[0, 0, 0]}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.8}
      zoomSpeed={1.2}
      panSpeed={0.8}
      maxPolarAngle={Math.PI * 0.8} // Prevent going underneath
      minPolarAngle={Math.PI * 0.1} // Prevent going too high
    />
  );
};

export default Enhanced3DCamera;
