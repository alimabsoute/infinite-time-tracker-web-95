
import React from 'react';
import { Text } from '@react-three/drei';

interface SafeText3DProps {
  position?: [number, number, number];
  fontSize?: number;
  color?: string;
  anchorX?: 'left' | 'center' | 'right';
  anchorY?: 'top' | 'middle' | 'bottom';
  rotation?: [number, number, number];
  maxWidth?: number;
  children: React.ReactNode;
}

const SafeText3D: React.FC<SafeText3DProps> = ({
  position = [0, 0, 0],
  fontSize = 0.3,
  color = 'white',
  anchorX = 'center',
  anchorY = 'middle',
  rotation,
  maxWidth,
  children
}) => {
  // Validate and sanitize props
  const safePosition: [number, number, number] = [
    isFinite(position[0]) ? position[0] : 0,
    isFinite(position[1]) ? position[1] : 0,
    isFinite(position[2]) ? position[2] : 0
  ];

  const safeFontSize = isFinite(fontSize) && fontSize > 0 ? fontSize : 0.3;
  const safeColor = typeof color === 'string' && color.length > 0 ? color : 'white';

  try {
    const textProps: any = {
      position: safePosition,
      fontSize: safeFontSize,
      color: safeColor,
      anchorX,
      anchorY
    };

    if (rotation && Array.isArray(rotation) && rotation.length === 3) {
      const safeRotation: [number, number, number] = [
        isFinite(rotation[0]) ? rotation[0] : 0,
        isFinite(rotation[1]) ? rotation[1] : 0,
        isFinite(rotation[2]) ? rotation[2] : 0
      ];
      textProps.rotation = safeRotation;
    }

    if (maxWidth && isFinite(maxWidth) && maxWidth > 0) {
      textProps.maxWidth = maxWidth;
    }

    return <Text {...textProps}>{children}</Text>;
  } catch (error) {
    console.warn('🔍 SafeText3D - Failed to render text:', error);
    return null;
  }
};

export default SafeText3D;
