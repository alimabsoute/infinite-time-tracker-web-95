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

  // DISABLED: Validation and restoration function that was causing timer pausing
  // This function was overwriting timer running states when switching tabs
  const validateAndRestoreTimerState = async (reason: string): Promise<boolean> => {
    console.log(`🚫 Validation and restoration disabled to preserve timer running state (${reason})`);
    return false;
  };

  // Simplified event handlers that preserve timer running state
  const browserEventHandlers = {
    onVisibilityChange: async (isVisible: boolean) => {
      const now = Date.now();
      const timeSinceLastChange = now - lastVisibilityChangeRef.current;
      lastVisibilityChangeRef.current = now;
      
      isPageVisibleRef.current = isVisible;
      console.log(`🔍 Visibility changed: ${isVisible ? 'visible' : 'hidden'}, time since last: ${timeSinceLastChange}ms`);
      
      try {
        if (isVisible) {
          console.log('👁️ Page became visible - preserving timer states');
          // DO NOT restore state on visibility change - this was causing the bug
          // Only update elapsed time for running timers without changing running state
          const currentTimers = timersRef.current;
          if (currentTimers && currentTimers.length > 0) {
            const runningTimers = currentTimers.filter(t => t.isRunning);
            console.log(`🏃 Found ${runningTimers.length} running timers - preserving their state`);
            
            // Just preserve running timers - don't modify elapsed time as it's handled elsewhere
            console.log(`🏃 Keeping ${runningTimers.length} timers in running state`);
            // No state modification needed - the timer effects handle elapsed time updates
          }
        } else {
          console.log('👋 Page became hidden - saving current state');
          const currentTimers = timersRef.current;
          if (currentTimers && currentTimers.length > 0) {
            await saveTimerState(currentTimers, 'visibility-hide');
          }
        }
      } catch (error) {
        console.error('❌ Error in visibility change handler:', error);
      }
    },

    onBeforeUnload: async () => {
      console.log('⚠️ Before unload - final state save');
      try {
        const currentTimers = timersRef.current;
        if (currentTimers && currentTimers.length > 0) {
          await saveTimerState(currentTimers, 'before-unload');
        }
      } catch (error) {
        console.error('❌ Error in before unload handler:', error);
      }
    },

    onPageHide: async () => {
      console.log('👋 Page hide - emergency state save');
      try {
        const currentTimers = timersRef.current;
        if (currentTimers && currentTimers.length > 0) {
          await saveTimerState(currentTimers, 'page-hide');
        }
      } catch (error) {
        console.error('❌ Error in page hide handler:', error);
      }
    },

    onPageShow: async () => {
      console.log('👁️ Page show - preserving timer states');
      try {
        // DO NOT restore state - just preserve current running timers
        const currentTimers = timersRef.current;
        if (currentTimers && currentTimers.length > 0) {
          const runningTimers = currentTimers.filter(t => t.isRunning);
          console.log(`🏃 Page show: preserving ${runningTimers.length} running timers`);
        }
      } catch (error) {
        console.error('❌ Error in page show handler:', error);
      }
    },

    onFocus: async () => {
      console.log('🎯 Window focus - preserving timer states');
      // DO NOT auto-correct or validate - just preserve current state
    },

    onBlur: async () => {
      console.log('😴 Window blur - saving state');
      try {
        const currentTimers = timersRef.current;
        if (currentTimers && currentTimers.length > 0) {
          await saveTimerState(currentTimers, 'blur');
        }
      } catch (error) {
        console.error('❌ Error in blur handler:', error);
      }
    }
  };

  // Register browser events
  useBrowserEvents(browserEventHandlers);

  // DISABLED: Periodic validation that could interfere with timer running states
  // This was potentially causing timers to be paused by auto-correction
  useEffect(() => {
    console.log('🚫 Periodic validation disabled to preserve timer running state');
    // No periodic validation needed - timer effects handle state updates
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Browser events cleanup');
      saveTimerState(timersRef.current, 'cleanup');
    };
  }, [saveTimerState, timersRef]);
};