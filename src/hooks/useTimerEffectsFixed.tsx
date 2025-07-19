import { useEffect, useRef } from 'react';
import { Timer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTimerPersistenceFixed } from './useTimerPersistenceFixed';
import { useTimerStateValidator } from './useTimerStateValidator';

interface UseTimerEffectsFixedProps {
  timers: Timer[];
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
  timersRef: React.MutableRefObject<Timer[]>;
}

export const useTimerEffectsFixed = ({ timers, setTimers, timersRef }: UseTimerEffectsFixedProps) => {
  const { user } = useAuth();
  const isPageVisibleRef = useRef(true);
  const { saveTimerState } = useTimerPersistenceFixed();
  const { validateTimerState } = useTimerStateValidator();
  const lastAutoSaveRef = useRef(0);
  const isUpdatingRef = useRef(false);

  // Enhanced timer update with validation
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(async () => {
      if (isUpdatingRef.current) return;
      isUpdatingRef.current = true;

      try {
        setTimers((currentTimers) => {
          const updatedTimers = currentTimers.map((timer) => {
            if (timer.isRunning) {
              return {
                ...timer,
                elapsedTime: timer.elapsedTime + 1000,
              };
            }
            return timer;
          });

          // Update timers ref for other hooks
          timersRef.current = updatedTimers;
          
          return updatedTimers;
        });

        // Auto-save every 10 seconds
        const now = Date.now();
        if (now - lastAutoSaveRef.current > 10000) {
          const runningTimers = timersRef.current.filter(t => t.isRunning);
          if (runningTimers.length > 0) {
            await saveTimerState(timersRef.current, 'auto-save');
            lastAutoSaveRef.current = now;
          }
        }
      } finally {
        isUpdatingRef.current = false;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, setTimers, timersRef, saveTimerState]);

  // Reduced periodic validation - only for severe local issues
  useEffect(() => {
    if (!user) return;

    const validationInterval = setInterval(async () => {
      if (isUpdatingRef.current) return;
      
      const runningTimers = timersRef.current.filter(t => t.isRunning);
      if (runningTimers.length > 0) {
        try {
          // Only validate locally, don't interfere with database mismatches
          const validation = await validateTimerState(timersRef.current, false);
          
          // Only correct severe local issues like invalid elapsed times
          if (!validation.isValid && validation.errors.some(error => error.includes('Invalid elapsed times'))) {
            console.log('🔧 Applied periodic corrections for severe local issues only');
            const correctedTimers = validation.correctedTimers || timersRef.current;
            setTimers(correctedTimers);
            timersRef.current = correctedTimers;
          }
        } catch (error) {
          console.error('❌ Periodic validation failed:', error);
        }
      }
    }, 300000); // Validate every 5 minutes instead of 1 minute

    return () => clearInterval(validationInterval);
  }, [user, validateTimerState, setTimers, timersRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const runningTimers = timersRef.current.filter(t => t.isRunning);
      if (runningTimers.length > 0) {
        saveTimerState(timersRef.current, 'cleanup');
      }
    };
  }, [saveTimerState, timersRef]);

  return {
    isPageVisibleRef
  };
};