
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
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circle representing time/clock */}
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke="#3B82F6"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
      
      {/* Inner timer segments */}
      <path
        d="M16 4 A12 12 0 0 1 28 16"
        stroke="#1D4ED8"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity="1"
      />
      
      <path
        d="M28 16 A12 12 0 0 1 16 28"
        stroke="#2563EB"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
      
      {/* Center dot representing active timer */}
      <circle
        cx="16"
        cy="16"
        r="2"
        fill="#1E40AF"
      />
      
      {/* Timer hand/pointer */}
      <line
        x1="16"
        y1="16"
        x2="16"
        y2="8"
        stroke="#1E40AF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Small accent marks for time intervals */}
      <circle cx="16" cy="6" r="1" fill="#3B82F6" opacity="0.8" />
      <circle cx="26" cy="16" r="1" fill="#3B82F6" opacity="0.8" />
      <circle cx="16" cy="26" r="1" fill="#3B82F6" opacity="0.8" />
      <circle cx="6" cy="16" r="1" fill="#3B82F6" opacity="0.8" />
    </svg>
  );
};

export default PhynxTimerLogo;
