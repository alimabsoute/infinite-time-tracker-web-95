
import React from 'react';

interface GeometryValidatorProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const GeometryValidator: React.FC<GeometryValidatorProps> = ({ 
  children, 
  fallback = null 
}) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.warn('GeometryValidator - Geometry error caught:', error);
    return <>{fallback}</>;
  }
};

export default GeometryValidator;
