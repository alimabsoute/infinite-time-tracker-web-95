
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

  console.log('🎭 EnhancedAnimationManager - Render state:', {
    confettiTrigger: !!confettiTrigger,
    celebrationTrigger: celebrationTrigger.type,
    activeAnimations: Array.from(activeAnimations)
  });

  const handleConfettiComplete = useCallback(() => {
    console.log('🎉 Confetti animation completed');
    setActiveAnimations(prev => {
      const next = new Set(prev);
      next.delete('confetti');
      return next;
    });
    onConfettiComplete();
  }, [onConfettiComplete]);

  const handleCelebrationComplete = useCallback(() => {
    console.log('🎊 Celebration animation completed');
    setActiveAnimations(prev => {
      const next = new Set(prev);
      next.delete('celebration');
      return next;
    });
    onCelebrationComplete();
  }, [onCelebrationComplete]);

  // Track active animations
  React.useEffect(() => {
    if (confettiTrigger) {
      setActiveAnimations(prev => new Set(prev).add('confetti'));
    }
  }, [confettiTrigger]);

  React.useEffect(() => {
    if (celebrationTrigger.type) {
      setActiveAnimations(prev => new Set(prev).add('celebration'));
    }
  }, [celebrationTrigger.type]);

  // Debug logging
  React.useEffect(() => {
    if (confettiTrigger || celebrationTrigger.type) {
      console.log('🎨 Starting ENHANCED animation sequence:', {
        confetti: !!confettiTrigger,
        celebration: celebrationTrigger.type,
        position: confettiTrigger ? { x: confettiTrigger.x, y: confettiTrigger.y } : null
      });
    }
  }, [confettiTrigger, celebrationTrigger.type]);

  return (
    <>
      {/* Enhanced Confetti Animation */}
      {confettiTrigger && (
        <ConfettiAnimation
          x={confettiTrigger.x}
          y={confettiTrigger.y}
          onComplete={handleConfettiComplete}
        />
      )}
      
      {/* Enhanced Celebration Animations */}
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
