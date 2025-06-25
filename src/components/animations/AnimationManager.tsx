
import React from 'react';
import DeletionAnimation from './DeletionAnimations';
import CreationAnimation from './CreationAnimations';

export type DeletionAnimationType = 'explode' | 'melt' | 'crumble' | 'vaporize';
export type CreationAnimationType = 'sparkle' | 'bounce' | 'glow' | 'spiral' | 'rainbow';

interface AnimationManagerProps {
  children: React.ReactNode;
  type: 'creation' | 'deletion';
  onComplete: () => void;
  animationType?: DeletionAnimationType | CreationAnimationType;
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

  const getRandomCreationAnimation = (): CreationAnimationType => {
    const animations: CreationAnimationType[] = ['sparkle', 'bounce', 'glow', 'spiral', 'rainbow'];
    return animations[Math.floor(Math.random() * animations.length)];
  };

  if (type === 'deletion') {
    const selectedAnimation = (animationType as DeletionAnimationType) || getRandomDeletionAnimation();
    return (
      <DeletionAnimation 
        animationType={selectedAnimation} 
        onComplete={onComplete}
      >
        {children}
      </DeletionAnimation>
    );
  }

  if (type === 'creation') {
    const selectedAnimation = (animationType as CreationAnimationType) || getRandomCreationAnimation();
    return (
      <CreationAnimation 
        animationType={selectedAnimation} 
        onComplete={onComplete}
      >
        {children}
      </CreationAnimation>
    );
  }

  return <>{children}</>;
};

export default AnimationManager;
