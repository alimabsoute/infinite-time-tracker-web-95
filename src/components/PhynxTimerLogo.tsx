
import React from 'react';

interface PhynxTimerLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const PhynxTimerLogo: React.FC<PhynxTimerLogoProps> = ({
  className = "",
  width = 32,
  height = 32
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
