
import { useEffect, useRef } from 'react';
import { Timer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTimerPersistenceEnhanced } from './useTimerPersistenceEnhanced';

interface UseTimerEffectsProps {
  timers: Timer[];
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
  timersRef: React.MutableRefObject<Timer[]>;
}

export const useTimerEffects = ({ timers, setTimers, timersRef }: UseTimerEffectsProps) => {
  const { user } = useAuth();
  const isPageVisibleRef = useRef(true);
  const syncIntervalRef = useRef<NodeJS.Timeout>();
  
  const {
    shouldAutoSave,
    handleTimerUpdateSave,
    enhancedSaveTimerState
  } = useTimerPersistenceEnhanced();

  // Enhanced auto-save with more frequent intervals
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      shouldAutoSave(timersRef);
    }, 5000); // Check every 5 seconds

    return () => clearInterval(autoSaveInterval);
  }, [shouldAutoSave, timersRef]);

  // Enhanced timer update with better sync
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
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

        // Update timers ref for other hooks to access
        timersRef.current = updatedTimers;
        
        // Handle persistence and sync
        handleTimerUpdateSave(timersRef, isPageVisibleRef);

        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user, setTimers, timersRef, handleTimerUpdateSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      // Final save on cleanup
      const runningTimers = timersRef.current.filter(t => t.isRunning);
      if (runningTimers.length > 0) {
        enhancedSaveTimerState(timersRef, 'cleanup');
      }
    };
  }, [enhancedSaveTimerState, timersRef]);

  return {
    isPageVisibleRef
  };
};
