
import React from 'react';

interface PomodoroPulseIndicatorProps {
  isActive: boolean;
  timerColor: string;
}

const PomodoroPulseIndicator: React.FC<PomodoroPulseIndicatorProps> = ({
  isActive,
  timerColor
}) => {
  if (!isActive) return null;

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '4px',
    right: '4px'
  };

  const outerRingStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    height: '8px',
    width: '8px',
    aspectRatio: '1',
    borderRadius: '50%'
  };

  const pulseRingStyle: React.CSSProperties = {
    position: 'absolute',
    display: 'inline-flex',
    height: '100%',
    width: '100%',
    aspectRatio: '1',
    borderRadius: '50%',
    backgroundColor: timerColor,
    opacity: 0.75,
    animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
  };

  const innerDotStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    height: '8px',
    width: '8px',
    aspectRatio: '1',
    borderRadius: '50%',
    backgroundColor: timerColor
  };

  return (
    <div style={containerStyle}>
      <span style={outerRingStyle}>
        <span style={pulseRingStyle} />
        <span style={innerDotStyle} />
      </span>
    </div>
  );
};

export default PomodoroPulseIndicator;
