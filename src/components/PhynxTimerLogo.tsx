
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
      {/* Main flame body */}
      <path
        d="M16 4C12 4 10 8 10 12C10 16 12 18 14 20C15 21 16 22 16 24C16 22 17 21 18 20C20 18 22 16 22 12C22 8 20 4 16 4Z"
        fill="currentColor"
        opacity="0.9"
      />
      
      {/* Inner flame highlight */}
      <path
        d="M16 6C14 6 13 8.5 13 11C13 13.5 14 15 15 16.5C15.5 17 16 17.5 16 19C16 17.5 16.5 17 17 16.5C18 15 19 13.5 19 11C19 8.5 18 6 16 6Z"
        fill="currentColor"
        opacity="0.7"
      />
      
      {/* Core flame */}
      <path
        d="M16 8C15 8 14.5 9.5 14.5 11C14.5 12.5 15 13.5 15.5 14.5C15.7 15 16 15.2 16 16C16 15.2 16.3 15 16.5 14.5C17 13.5 17.5 12.5 17.5 11C17.5 9.5 17 8 16 8Z"
        fill="currentColor"
        opacity="0.5"
      />
      
      {/* Flame sparks/embers */}
      <circle cx="12" cy="10" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="20" cy="9" r="0.8" fill="currentColor" opacity="0.5" />
      <circle cx="11" cy="14" r="0.6" fill="currentColor" opacity="0.4" />
      <circle cx="21" cy="13" r="0.7" fill="currentColor" opacity="0.4" />
      <circle cx="13" cy="7" r="0.5" fill="currentColor" opacity="0.3" />
      <circle cx="19" cy="6" r="0.4" fill="currentColor" opacity="0.3" />
      
      {/* Base glow effect */}
      <ellipse
        cx="16"
        cy="24"
        rx="6"
        ry="2"
        fill="currentColor"
        opacity="0.2"
      />
    </svg>
  );
};

export default PhynxTimerLogo;
