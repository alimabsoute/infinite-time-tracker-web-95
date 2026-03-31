import React from 'react';

interface CustomBubbleDotProps {
  cx?: number;
  cy?: number;
  payload?: any;
  onClick?: (data: any) => void;
  onMouseEnter?: (timerId: string) => void;
  onMouseLeave?: () => void;
  activePoint?: string | null;
}

export const CustomBubbleDot: React.FC<CustomBubbleDotProps> = ({
  cx = 0,
  cy = 0,
  payload,
  onClick,
  onMouseEnter,
  onMouseLeave,
  activePoint
}) => {
  if (!payload) return null;

  // Calculate radius from z-value (5-45px range for dramatic size differences)
  const radius = Math.max(5, Math.min(45, payload.z || 10));
  
  const isActive = activePoint === payload.timerId;
  const fillOpacity = isActive ? 1.0 : 0.7;
  const strokeColor = payload.isRunning ? 'rgba(34, 197, 94, 1)' : 'rgba(255, 255, 255, 0.8)';
  const strokeWidth = payload.isRunning ? 3 : 2;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={payload.color}
      fillOpacity={fillOpacity}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      style={{ cursor: 'pointer' }}
      onClick={() => onClick?.(payload)}
      onMouseEnter={() => onMouseEnter?.(payload.timerId)}
      onMouseLeave={onMouseLeave}
    />
  );
};