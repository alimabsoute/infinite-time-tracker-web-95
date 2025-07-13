
import { useState, useCallback, useRef } from 'react';

export const useTimerAnimations = () => {
  const [confettiTrigger, setConfettiTrigger] = useState<{ x: number; y: number; id: string } | null>(null);
  const [celebrationTrigger, setCelebrationTrigger] = useState<{ type: 'fireworks' | 'sparkles' | 'balloons' | 'animals' | null }>({ type: null });
  const confettiTimeoutRef = useRef<NodeJS.Timeout>();
  const celebrationTimeoutRef = useRef<NodeJS.Timeout>();

  // Clear confetti trigger function
  const clearConfettiTrigger = useCallback(() => {
    console.log('🧹 Clearing confetti trigger');
    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current);
    }
    setConfettiTrigger(null);
  }, []);

  // Clear celebration trigger function
  const clearCelebrationTrigger = useCallback(() => {
    console.log('🧹 Clearing celebration trigger');
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
    }
    setCelebrationTrigger({ type: null });
  }, []);

  return {
    confettiTrigger,
    celebrationTrigger,
    setConfettiTrigger,
    setCelebrationTrigger,
    clearConfettiTrigger,
    clearCelebrationTrigger
  };
};
