import React from 'react';
interface PhynxTimerLogoProps {
  className?: string;
  width?: number;
  height?: number;
}
const PhynxTimerLogo: React.FC<PhynxTimerLogoProps> = ({
  className = "",
  width = 320,
  // Increased default size to 320 (5x larger than original 64)
  height = 320 // Increased default size to 320 (5x larger than original 64)
}) => {
  return <img src="/lovable-uploads/2ecb976f-74e3-4218-9ecf-022c5d762ed3.png" alt="PhynxTimer Logo" width={width} height={height} className={className} />;
};
export default PhynxTimerLogo;