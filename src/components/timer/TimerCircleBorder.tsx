
import React from 'react';
import { ProcessedTimerColors } from '../../utils/timerColorProcessor';

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
  // Enhanced style objects for maximum specificity and perfect circles
  const primaryBorderStyle: React.CSSProperties = {
    borderColor: colors.primaryBorder,
    borderWidth: '6px',
    borderStyle: 'solid',
    borderRadius: '50%',
    width: '100%',
    height: '100%',
    aspectRatio: '1',
    boxShadow: `
      0 0 0 1px ${colors.primaryBorder},
      0 4px 20px ${colors.shadowColor}40,
      inset 0 0 20px ${colors.shadowColor}15,
      0 8px 32px ${colors.shadowColor}25
    `,
    position: 'absolute',
    top: '0',
    left: '0',
    zIndex: 1
  };

  const secondaryBorderStyle: React.CSSProperties = {
    borderColor: colors.secondaryBorder,
    borderWidth: '2px',
    borderStyle: 'solid',
    borderRadius: '50%',
    width: 'calc(100% - 4px)',
    height: 'calc(100% - 4px)',
    aspectRatio: '1',
    position: 'absolute',
    top: '2px',
    left: '2px',
    zIndex: 2
  };

  const innerContentStyle: React.CSSProperties = {
    backgroundColor: colors.backgroundFill,
    backdropFilter: 'blur(10px)',
    borderRadius: '50%',
    width: 'calc(100% - 16px)',
    height: 'calc(100% - 16px)',
    aspectRatio: '1',
    position: 'absolute',
    top: '8px',
    left: '8px',
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  };

  return (
    <div className="absolute top-12 left-4 right-4 bottom-4 timer-circle-container transition-all duration-300 ease-in-out group-hover:scale-95">
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
  );
};

export default TimerCircleBorder;
