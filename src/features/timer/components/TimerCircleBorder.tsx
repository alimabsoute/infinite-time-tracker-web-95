
import React from 'react';
import { ProcessedTimerColors } from '@/utils/timerColorProcessor';

interface TimerCircleBorderProps {
  colors: ProcessedTimerColors;
  isRunning: boolean;
  children: React.ReactNode;
}

const TimerCircleBorder: React.FC<TimerCircleBorderProps> = ({
  colors,
  isRunning,
  children
}) => {
  // Container style for perfect circular constraint
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '48px', // Account for header space
    left: '16px',
    right: '16px',
    bottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '240px',
    minHeight: '240px'
  };

  // Circle constraint wrapper to ensure perfect circles
  const circleConstraintStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: '280px',
    aspectRatio: '1',
    borderRadius: '50%',
    overflow: 'visible'
  };

  // Enhanced style objects for maximum specificity and perfect circles
  const primaryBorderStyle: React.CSSProperties = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    aspectRatio: '1',
    borderColor: colors.primaryBorder,
    borderWidth: '6px',
    borderStyle: 'solid',
    borderRadius: '50%',
    boxShadow: `
      0 0 0 1px ${colors.primaryBorder},
      0 4px 20px ${colors.shadowColor}40,
      inset 0 0 20px ${colors.shadowColor}15,
      0 8px 32px ${colors.shadowColor}25
    `,
    zIndex: 1,
    boxSizing: 'border-box'
  };

  const secondaryBorderStyle: React.CSSProperties = {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: 'calc(100% - 4px)',
    height: 'calc(100% - 4px)',
    aspectRatio: '1',
    borderColor: colors.secondaryBorder,
    borderWidth: '2px',
    borderStyle: 'solid',
    borderRadius: '50%',
    zIndex: 2,
    boxSizing: 'border-box'
  };

  const innerContentStyle: React.CSSProperties = {
    position: 'absolute',
    top: '8px',
    left: '8px',
    width: 'calc(100% - 16px)',
    height: 'calc(100% - 16px)',
    aspectRatio: '1',
    backgroundColor: colors.backgroundFill,
    backdropFilter: 'blur(10px)',
    borderRadius: '50%',
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxSizing: 'border-box'
  };

  return (
    <div style={containerStyle} className="timer-circle-container transition-all duration-300 ease-in-out group-hover:scale-95">
      {/* Circle constraint wrapper for perfect aspect ratio */}
      <div style={circleConstraintStyle} className="timer-circle-wrapper">
        {/* Primary border layer with enhanced styling for perfect circle */}
        <div 
          className={`timer-primary-border ${isRunning ? 'timer-running-animation' : ''}`}
          style={primaryBorderStyle}
        />
        
        {/* Secondary border for enhanced definition */}
        <div 
          className="timer-secondary-border"
          style={secondaryBorderStyle}
        />
        
        {/* Inner content container */}
        <div 
          className="timer-inner-content"
          style={innerContentStyle}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default TimerCircleBorder;
