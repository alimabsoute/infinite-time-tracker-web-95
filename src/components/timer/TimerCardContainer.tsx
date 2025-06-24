
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
    </article>
  );
};

export default TimerCardContainer;
