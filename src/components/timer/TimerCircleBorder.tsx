
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
  // Enhanced style objects for maximum specificity
  const primaryBorderStyle: React.CSSProperties = {
    borderColor: colors.primaryBorder,
    borderWidth: '6px',
    borderStyle: 'solid',
    boxShadow: `
      0 0 0 1px ${colors.primaryBorder},
      0 4px 20px ${colors.shadowColor}40,
      inset 0 0 20px ${colors.shadowColor}15,
      0 8px 32px ${colors.shadowColor}25
    `
  };

  const secondaryBorderStyle: React.CSSProperties = {
    borderColor: colors.secondaryBorder,
    borderWidth: '2px',
    borderStyle: 'solid'
  };

  const innerContentStyle: React.CSSProperties = {
    backgroundColor: colors.backgroundFill,
    backdropFilter: 'blur(10px)'
  };

  return (
    <div className="absolute top-12 left-4 right-4 bottom-4 timer-circle-container transition-all duration-300 ease-in-out group-hover:scale-95">
      {/* Primary border layer with enhanced styling */}
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
