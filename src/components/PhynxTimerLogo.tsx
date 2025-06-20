
import React from 'react';

interface PhynxTimerLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const PhynxTimerLogo: React.FC<PhynxTimerLogoProps> = ({
  className = "",
  width = 64, // Increased default size from 32 to 64 (2x larger)
  height = 64 // Increased default size from 32 to 64 (2x larger)
}) => {
  return (
    <img
      src="/lovable-uploads/2ecb976f-74e3-4218-9ecf-022c5d762ed3.png"
      alt="PhynxTimer Logo"
      width={width}
      height={height}
      className={className}
    />
  );
};

export default PhynxTimerLogo;
