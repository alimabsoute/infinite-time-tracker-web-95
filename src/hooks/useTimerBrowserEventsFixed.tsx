import { useEffect, useRef } from 'react';
import { Timer } from '../types';
import { useBrowserEvents } from './useBrowserEvents';
import { useTimerPersistenceFixed } from './useTimerPersistenceFixed';
import { useTimerStateValidator } from './useTimerStateValidator';

interface UseTimerBrowserEventsFixedProps {
  timersRef: React.MutableRefObject<Timer[]>;
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
  isPageVisibleRef: React.MutableRefObject<boolean>;
}

export const useTimerBrowserEventsFixed = ({ 
  timersRef, 
  setTimers, 
  isPageVisibleRef 
}: UseTimerBrowserEventsFixedProps) => {
  const { 
    saveTimerState, 
    loadTimerState, 
    restoreTimerElapsedTime 
  } = useTimerPersistenceFixed();
  
  const { 
    validateTimerState, 
    autoCorrectTimerState 
  } = useTimerStateValidator();

  const restorationInProgressRef = useRef(false);
  const lastVisibilityChangeRef = useRef(Date.now());

  // Enhanced validation and restoration
  const validateAndRestoreTimerState = async (reason: string): Promise<boolean> => {
    if (restorationInProgressRef.current) {
      console.log('🔄 Restoration already in progress, skipping');
      return false;
    }

    restorationInProgressRef.current = true;

    try {
      console.log(`🔍 Starting validation and restoration (${reason})`);
      
      // Load persistence data
      const persistenceData = loadTimerState();
      if (!persistenceData) {
        console.log('📥 No persistence data to restore');
        restorationInProgressRef.current = false;
        return false;
      }

      // Validate current timer state
      const currentTimers = timersRef.current;
      const validation = await validateTimerState(currentTimers, true);
      
      let correctedTimers = currentTimers;
      
      if (!validation.isValid) {
        console.log('🔧 Applying corrections before restoration');
        correctedTimers = await autoCorrectTimerState(currentTimers);
      }

      // Restore elapsed time
      const restoredTimers = await restoreTimerElapsedTime(correctedTimers, persistenceData);
      
      // Check if we actually need to update
      const hasChanges = restoredTimers.some((timer, index) => {
        const original = currentTimers[index];
        return !original || 
               timer.elapsedTime !== original.elapsedTime || 
               timer.isRunning !== original.isRunning;
      });

      if (hasChanges) {
        console.log('✅ Applying timer state changes');
        setTimers(restoredTimers);
        timersRef.current = restoredTimers;
        
        // Save the corrected state
        await saveTimerState(restoredTimers, `${reason}-corrected`);
      } else {
        console.log('✅ No changes needed after validation');
      }

      restorationInProgressRef.current = false;
      return hasChanges;
    } catch (error) {
      console.error('❌ Error in validation and restoration:', error);
      restorationInProgressRef.current = false;
      return false;
    }
  };

  // Enhanced browser event handlers
  const browserEventHandlers = {
    onVisibilityChange: async (isVisible: boolean) => {
      const now = Date.now();
      const timeSinceLastChange = now - lastVisibilityChangeRef.current;
      lastVisibilityChangeRef.current = now;
      
      isPageVisibleRef.current = isVisible;
      
      console.log(`👁️ Visibility changed: ${isVisible ? 'visible' : 'hidden'}`);

      if (isVisible) {
        // Page became visible - restore state
        console.log('📱 Page visible - starting restoration...');
        
        // Small delay to ensure state is stable
        setTimeout(async () => {
          await validateAndRestoreTimerState('visibility-visible');
        }, 100);
        
      } else {
        // Page became hidden - save state immediately
        console.log('💾 Page hidden - saving state...');
        const correctedTimers = await saveTimerState(timersRef.current, 'visibility-hidden');
        if (correctedTimers && correctedTimers !== timersRef.current) {
          setTimers(correctedTimers);
          timersRef.current = correctedTimers;
        }
      }
    },

    onBeforeUnload: async () => {
      console.log('🔄 Before unload - final save');
      await saveTimerState(timersRef.current, 'beforeunload');
    },

    onPageHide: async () => {
      console.log('👋 Page hide - saving state');
      await saveTimerState(timersRef.current, 'pagehide');
    },

    onPageShow: async () => {
      console.log('👋 Page show - restoring state');
      await validateAndRestoreTimerState('pageshow');
    },

    onFocus: async () => {
      console.log('🎯 Window focus - checking state');
      // Only restore if it's been a while since last visibility change
      const timeSinceVisibilityChange = Date.now() - lastVisibilityChangeRef.current;
      if (timeSinceVisibilityChange > 2000) {
        await validateAndRestoreTimerState('focus');
      }
    },

    onBlur: async () => {
      console.log('😴 Window blur - saving state');
      const correctedTimers = await saveTimerState(timersRef.current, 'blur');
      if (correctedTimers && correctedTimers !== timersRef.current) {
        setTimers(correctedTimers);
        timersRef.current = correctedTimers;
      }
    }
  };

  // Register browser events
  useBrowserEvents(browserEventHandlers);

  // Reduced frequency periodic validation when page is visible - only for severe issues
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isPageVisibleRef.current && !restorationInProgressRef.current) {
        const runningTimers = timersRef.current.filter(t => t.isRunning);
        // Only validate if we have running timers and it's been a while
        if (runningTimers.length > 0) {
          const validation = await validateTimerState(timersRef.current, false); // Don't validate against database frequently
          // Only correct severe local issues, not database mismatches
          if (!validation.isValid && validation.errors.some(error => error.includes('Invalid elapsed times'))) {
            console.log('🔧 Periodic validation found severe local issues, correcting...');
            const correctedTimers = await autoCorrectTimerState(timersRef.current);
            if (correctedTimers !== timersRef.current) {
              setTimers(correctedTimers);
              timersRef.current = correctedTimers;
            }
          }
        }
      }
    }, 120000); // Check every 2 minutes instead of 30 seconds

    return () => clearInterval(interval);
  }, [validateTimerState, autoCorrectTimerState, setTimers, timersRef, isPageVisibleRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Browser events cleanup');
      saveTimerState(timersRef.current, 'cleanup');
    };
  }, [saveTimerState, timersRef]);
};