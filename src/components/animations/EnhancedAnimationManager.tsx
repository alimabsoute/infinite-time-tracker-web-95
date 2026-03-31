
import React, { useState, useCallback, useRef } from 'react';
import ConfettiAnimation from './ConfettiAnimation';
import CelebrationAnimations from './CelebrationAnimations';

type CelebrationType = 'fireworks' | 'sparkles' | 'balloons' | 'animals';

interface EnhancedAnimationManagerProps {
  confettiTrigger: { x: number; y: number; id: string } | null;
  celebrationTrigger: { type: CelebrationType | null };
  onConfettiComplete: () => void;
  onCelebrationComplete: () => void;
}

const EnhancedAnimationManager: React.FC<EnhancedAnimationManagerProps> = ({
  confettiTrigger,
  celebrationTrigger,
  onConfettiComplete,
  onCelebrationComplete,
}) => {
  const [_activeAnimations, setActiveAnimations] = useState<Set<string>>(new Set());
  const animationTimeoutRef = useRef<NodeJS.Timeout>();

  const handleConfettiComplete = useCallback(() => {
    setActiveAnimations(prev => {
      const next = new Set(prev);
      next.delete('confetti');
      return next;
    });
    onConfettiComplete();
  }, [onConfettiComplete]);

  const handleCelebrationComplete = useCallback(() => {
    setActiveAnimations(prev => {
      const next = new Set(prev);
      next.delete('celebration');
      return next;
    });
    onCelebrationComplete();
  }, [onCelebrationComplete]);

  // OPTIMIZED: Smart animation management to prevent overlapping animations
  React.useEffect(() => {
    if (confettiTrigger) {
      // Clear any existing animation timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      setActiveAnimations(prev => new Set(prev).add('confetti'));
      
      // Set a timeout to automatically clean up if callback fails
      animationTimeoutRef.current = setTimeout(() => {
        handleConfettiComplete();
      }, 4000);
    }
  }, [confettiTrigger, handleConfettiComplete]);

  React.useEffect(() => {
    if (celebrationTrigger.type) {
      setActiveAnimations(prev => new Set(prev).add('celebration'));
      
      // Set a timeout to automatically clean up if callback fails
      animationTimeoutRef.current = setTimeout(() => {
        handleCelebrationComplete();
      }, 3500);
    }
  }, [celebrationTrigger.type, handleCelebrationComplete]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Optimized Confetti Animation */}
      {confettiTrigger && (
        <ConfettiAnimation
          x={confettiTrigger.x}
          y={confettiTrigger.y}
          onComplete={handleConfettiComplete}
        />
      )}
      
      {/* Optimized Celebration Animations */}
      {celebrationTrigger.type && (
        <CelebrationAnimations
          type={celebrationTrigger.type}
          onComplete={handleCelebrationComplete}
        />
      )}
    </>
  );
};

export default EnhancedAnimationManager;
