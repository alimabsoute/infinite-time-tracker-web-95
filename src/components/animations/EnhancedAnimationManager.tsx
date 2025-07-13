
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
  const [activeAnimations, setActiveAnimations] = useState<Set<string>>(new Set());
  const animationTimeoutRef = useRef<NodeJS.Timeout>();

  console.log('🎭 OPTIMIZED EnhancedAnimationManager - Render state:', {
    confettiTrigger: !!confettiTrigger,
    celebrationTrigger: celebrationTrigger.type,
    activeAnimations: Array.from(activeAnimations)
  });

  const handleConfettiComplete = useCallback(() => {
    console.log('🎉 OPTIMIZED Confetti animation completed');
    setActiveAnimations(prev => {
      const next = new Set(prev);
      next.delete('confetti');
      return next;
    });
    onConfettiComplete();
  }, [onConfettiComplete]);

  const handleCelebrationComplete = useCallback(() => {
    console.log('🎊 OPTIMIZED Celebration animation completed');
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
        console.log('⚠️ Confetti animation timeout - force cleanup');
        handleConfettiComplete();
      }, 4000);
    }
  }, [confettiTrigger, handleConfettiComplete]);

  React.useEffect(() => {
    if (celebrationTrigger.type) {
      setActiveAnimations(prev => new Set(prev).add('celebration'));
      
      // Set a timeout to automatically clean up if callback fails
      animationTimeoutRef.current = setTimeout(() => {
        console.log('⚠️ Celebration animation timeout - force cleanup');
        handleCelebrationComplete();
      }, 3500);
    }
  }, [celebrationTrigger.type, handleCelebrationComplete]);

  // Debug logging
  React.useEffect(() => {
    if (confettiTrigger || celebrationTrigger.type) {
      console.log('🎨 Starting OPTIMIZED animation sequence:', {
        confetti: !!confettiTrigger,
        celebration: celebrationTrigger.type,
        position: confettiTrigger ? { x: confettiTrigger.x, y: confettiTrigger.y } : null
      });
    }
  }, [confettiTrigger, celebrationTrigger.type]);

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
