
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
  return (
    <article 
      className="relative group w-full max-w-[280px] h-[320px] mx-auto flex-shrink-0 p-4 transition-all duration-300 ease-in-out hover:scale-95"
      role="region"
      aria-label={`Timer for ${name}${category ? ` in category ${category}` : ''}`}
      tabIndex={0}
      style={{
        minWidth: '280px',
        minHeight: '320px'
      }}
    >
      {children}
      
      {/* Debug border for development - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="absolute top-12 left-4 right-4 bottom-4 pointer-events-none z-50"
          style={{
            border: '2px dashed rgba(255, 0, 0, 0.3)',
            borderRadius: '50%'
          }}
        />
      )}
    </article>
  );
};

export default TimerCardContainer;
