
import React from 'react';

interface TimerCardContainerProps {
  name: string;
  category?: string;
  timerId: string;
  children: React.ReactNode;
}

const TimerCardContainer: React.FC<TimerCardContainerProps> = ({
  name,
  category,
  timerId,
  children
}) => {
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: '320px',
    height: '320px',
    aspectRatio: '1',
    margin: '0 auto',
    flexShrink: 0,
    padding: '16px',
    transition: 'all 0.3s ease-in-out',
    minWidth: '320px',
    minHeight: '320px'
  };

  return (
    <article 
      className="group hover:scale-95"
      role="region"
      aria-label={`Timer for ${name}${category ? ` in category ${category}` : ''}`}
      tabIndex={0}
      style={containerStyle}
    >
      {children}
      
      {/* Debug border for development - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="absolute pointer-events-none z-50"
          style={{
            top: '48px',
            left: '16px',
            right: '16px',
            bottom: '16px',
            border: '2px dashed rgba(255, 0, 0, 0.3)',
            borderRadius: '50%',
            aspectRatio: '1'
          }}
        />
      )}
    </article>
  );
};

export default TimerCardContainer;
