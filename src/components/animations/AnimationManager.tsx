
import React from 'react';
import DeletionAnimation from './DeletionAnimations';

export type DeletionAnimationType = 'explode' | 'melt' | 'crumble' | 'vaporize';

interface AnimationManagerProps {
  children: React.ReactNode;
  type: 'deletion';
  onComplete: () => void;
  animationType?: DeletionAnimationType;
}

const AnimationManager: React.FC<AnimationManagerProps> = ({
  children,
  type,
  onComplete,
  animationType
}) => {
  const getRandomDeletionAnimation = (): DeletionAnimationType => {
    const animations: DeletionAnimationType[] = ['explode', 'melt', 'crumble', 'vaporize'];
    return animations[Math.floor(Math.random() * animations.length)];
  };

  if (type === 'deletion') {
    const selectedAnimation = animationType || getRandomDeletionAnimation();
    return (
      <DeletionAnimation 
        animationType={selectedAnimation} 
        onComplete={onComplete}
      >
        {children}
      </DeletionAnimation>
    );
  }

  return <>{children}</>;
};

export default AnimationManager;
