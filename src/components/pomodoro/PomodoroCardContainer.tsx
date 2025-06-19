
import React from 'react';
import { cn } from '@/lib/utils';
import { ProcessedPomodoroColors } from '@/utils/pomodoroColorProcessor';

interface PomodoroCardContainerProps {
  phaseLabel: string;
  isActive: boolean;
  colors: ProcessedPomodoroColors;
  children: React.ReactNode;
  className?: string;
}

const PomodoroCardContainer: React.FC<PomodoroCardContainerProps> = ({
  phaseLabel,
  isActive,
  colors,
  children,
  className
}) => {
  // Enhanced style objects for rectangular Pomodoro cards
  const primaryBorderStyle: React.CSSProperties = {
    border: `4px solid ${colors.primaryBorder}`,
    borderRadius: '12px',
    boxShadow: `
      0 0 0 1px ${colors.primaryBorder}, 
      0 4px 20px ${colors.shadowColor}40, 
      inset 0 0 20px ${colors.shadowColor}20,
      0 8px 32px ${colors.shadowColor}30
    `,
    background: `linear-gradient(135deg, ${colors.shadowColor}10, transparent 70%)`
  };

  const innerContentStyle: React.CSSProperties = {
    backgroundColor: colors.backgroundFill,
    backdropFilter: 'blur(10px)',
    border: `2px solid ${colors.secondaryBorder}60`,
    borderRadius: '8px',
    boxShadow: `inset 0 0 30px ${colors.shadowColor}20`
  };

  return (
    <article 
      className={cn(
        'relative group w-full max-w-[320px] h-[280px] mx-auto flex-shrink-0 p-4 transition-all duration-300 ease-in-out hover:scale-95',
        className
      )}
      role="region"
      aria-label={`Pomodoro timer - ${phaseLabel}`}
      tabIndex={0}
      style={{
        minWidth: '320px',
        minHeight: '280px'
      }}
    >
      {/* Main rectangular card container with enhanced borders */}
      <div className="relative w-full h-full transition-all duration-300 ease-in-out group-hover:scale-95">
        
        {/* Primary border layer with enhanced styling */}
        <div 
          className={`absolute inset-0 transition-all duration-300 ease-in-out ${isActive ? 'timer-running-animation' : ''}`}
          style={primaryBorderStyle}
        />
        
        {/* Inner content container */}
        <div 
          className="absolute inset-2 transition-all duration-300 ease-in-out"
          style={innerContentStyle}
        >
          {children}
        </div>
      </div>
      
      {/* Debug border for development */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="absolute inset-4 pointer-events-none z-50"
          style={{
            border: '2px dashed rgba(255, 165, 0, 0.4)',
            borderRadius: '12px'
          }}
        />
      )}
    </article>
  );
};

export default PomodoroCardContainer;
