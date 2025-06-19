
import React from 'react';

interface TimerStatusIndicatorProps {
  isRunning: boolean;
  isPomodoroActive: boolean;
  timerColor: string;
}

const TimerStatusIndicator: React.FC<TimerStatusIndicatorProps> = ({
  isRunning,
  isPomodoroActive,
  timerColor,
}) => {
  if (!isRunning && !isPomodoroActive) return null;

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '4px',
    right: '4px',
    display: 'flex',
    alignItems: 'center'
  };

  const outerRingStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    height: '8px',
    width: '8px',
    aspectRatio: '1',
    borderRadius: '50%'
  };

  const color = isPomodoroActive ? '#ef4444' : timerColor;

  const pulseRingStyle: React.CSSProperties = {
    position: 'absolute',
    display: 'inline-flex',
    height: '100%',
    width: '100%',
    aspectRatio: '1',
    borderRadius: '50%',
    backgroundColor: color,
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
    backgroundColor: color
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

export default TimerStatusIndicator;
