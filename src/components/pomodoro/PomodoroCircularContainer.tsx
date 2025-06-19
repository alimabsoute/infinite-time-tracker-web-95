
import React from 'react';
import { cn } from '@/lib/utils';
import { ProcessedPomodoroColors } from '@/utils/pomodoroColorProcessor';

interface PomodoroCircularContainerProps {
  phaseLabel: string;
  isActive: boolean;
  colors: ProcessedPomodoroColors;
  children: React.ReactNode;
  className?: string;
}

const PomodoroCircularContainer: React.FC<PomodoroCircularContainerProps> = ({
  phaseLabel,
  isActive,
  colors,
  children,
  className
}) => {
  // Enhanced style objects for perfect circular Pomodoro cards
  const primaryBorderStyle: React.CSSProperties = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    aspectRatio: '1',
    border: `6px solid ${colors.primaryBorder}`,
    borderRadius: '50%',
    boxShadow: `
      0 0 0 1px ${colors.primaryBorder}, 
      0 4px 20px ${colors.shadowColor}40, 
      inset 0 0 20px ${colors.shadowColor}20,
      0 8px 32px ${colors.shadowColor}30
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
    border: `2px solid ${colors.secondaryBorder}60`,
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

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '48px',
    left: '16px',
    right: '16px',
    bottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '240px',
    minHeight: '240px'
  };

  const circleConstraintStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: '280px',
    aspectRatio: '1',
    borderRadius: '50%',
    overflow: 'visible'
  };

  return (
    <article 
      className={cn(
        'relative group w-full max-w-[320px] h-[320px] mx-auto flex-shrink-0 p-4 transition-all duration-300 ease-in-out hover:scale-95',
        className
      )}
      role="region"
      aria-label={`Pomodoro timer - ${phaseLabel}`}
      tabIndex={0}
      style={{
        minWidth: '320px',
        minHeight: '320px'
      }}
    >
      {/* Circular timer container with multiple border layers */}
      <div style={containerStyle} className="pomodoro-circle-container transition-all duration-300 ease-in-out group-hover:scale-95">
        {/* Circle constraint wrapper for perfect aspect ratio */}
        <div style={circleConstraintStyle} className="pomodoro-circle-wrapper">
          {/* Primary border layer with enhanced styling for perfect circle */}
          <div 
            className={`pomodoro-primary-border ${isActive ? 'timer-running-animation' : ''}`}
            style={primaryBorderStyle}
          />
          
          {/* Secondary border for enhanced definition */}
          <div 
            className="pomodoro-secondary-border"
            style={secondaryBorderStyle}
          />
          
          {/* Inner content container */}
          <div 
            className="pomodoro-inner-content"
            style={innerContentStyle}
          >
            {children}
          </div>
        </div>
      </div>
      
      {/* Debug border for development */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="absolute pointer-events-none z-50"
          style={{
            top: '48px',
            left: '16px',
            right: '16px',
            bottom: '16px',
            border: '2px dashed rgba(255, 165, 0, 0.4)',
            borderRadius: '50%',
            aspectRatio: '1'
          }}
        />
      )}
    </article>
  );
};

export default PomodoroCircularContainer;
