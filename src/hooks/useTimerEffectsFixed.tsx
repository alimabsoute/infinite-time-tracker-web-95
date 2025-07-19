
import { useEffect, useRef, useCallback } from 'react';
import { Timer } from '../types';
import { useTimerPersistenceEnhanced } from './useTimerPersistenceEnhanced';
import { useBrowserEventsFixed } from './useBrowserEventsFixed';

interface UseTimerEffectsProps {
  timers: Timer[];
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
  timersRef: React.MutableRefObject<Timer[]>;
}

export const useTimerEffectsFixed = ({ timers, setTimers, timersRef }: UseTimerEffectsProps) => {
  const { saveEnhancedTimerState } = useTimerPersistenceEnhanced();
  const isPageVisibleRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastUpdateRef = useRef(Date.now());

  // Enhanced timer update function with protection
  const updateRunningTimers = useCallback(() => {
    const now = Date.now();
    const deltaTime = now - lastUpdateRef.current;
    
    // Skip updates if delta is too large (indicates system sleep/pause)
    if (deltaTime > 5000) {
      console.log(`⚠️ Large time delta detected (${deltaTime}ms), skipping update to prevent jumps`);
      lastUpdateRef.current = now;
      return;
    }
    
    lastUpdateRef.current = now;
    
    setTimers(prevTimers => {
      const updatedTimers = prevTimers.map(timer => {
        if (timer.isRunning && isPageVisibleRef.current) {
          return {
            ...timer,
            elapsedTime: timer.elapsedTime + deltaTime
          };
        }
        return timer;
      });
      
      // Check if any timers were actually updated
      const hasUpdates = updatedTimers.some((timer, index) => 
        timer.elapsedTime !== prevTimers[index].elapsedTime
      );
      
      return hasUpdates ? updatedTimers : prevTimers;
    });
  }, [setTimers]);

  // Enhanced browser event handlers
  const browserEventHandlers = {
    onVisibilityChange: (isVisible: boolean) => {
      isPageVisibleRef.current = isVisible;
      console.log(`👁️ Enhanced visibility: ${isVisible ? 'visible' : 'hidden'}`);
      
      if (isVisible) {
        // Page became visible - restart interval and save state
        lastUpdateRef.current = Date.now();
        const runningTimers = timersRef.current.filter(t => t.isRunning);
        console.log(`🏃 Page visible: ${runningTimers.length} timers running`);
        
        if (runningTimers.length > 0) {
          saveEnhancedTimerState(timersRef.current, 'visibility-visible');
        }
      } else {
        // Page became hidden - save current state
        saveEnhancedTimerState(timersRef.current, 'visibility-hidden');
      }
    },

    onBeforeUnload: () => {
      console.log('💾 Enhanced before unload - saving timer state');
      saveEnhancedTimerState(timersRef.current, 'before-unload');
    },

    onPageHide: () => {
      console.log('💾 Enhanced page hide - saving timer state');
      saveEnhancedTimerState(timersRef.current, 'page-hide');
    },

    onPageShow: () => {
      console.log('🔄 Enhanced page show - restarting timers');
      lastUpdateRef.current = Date.now();
      const runningTimers = timersRef.current.filter(t => t.isRunning);
      if (runningTimers.length > 0) {
        saveEnhancedTimerState(timersRef.current, 'page-show');
      }
    },

    onFocus: () => {
      console.log('🎯 Enhanced focus - restarting timer updates');
      lastUpdateRef.current = Date.now();
    },

    onBlur: () => {
      console.log('😴 Enhanced blur - saving timer state');
      saveEnhancedTimerState(timersRef.current, 'blur');
    }
  };

  // Register enhanced browser events
  useBrowserEventsFixed(browserEventHandlers);

  // Enhanced timer interval management
  useEffect(() => {
    const runningTimers = timers.filter(timer => timer.isRunning);
    
    if (runningTimers.length > 0) {
      console.log(`⏱️ Starting enhanced timer interval for ${runningTimers.length} running timers`);
      
      // Clear existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Reset last update time
      lastUpdateRef.current = Date.now();
      
      // Start new interval with more frequent updates (500ms for smoother updates)
      intervalRef.current = setInterval(updateRunningTimers, 500);
    } else {
      console.log('⏹️ No running timers - clearing interval');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timers, updateRunningTimers]);

  // Enhanced auto-save for running timers
  useEffect(() => {
    const runningTimers = timers.filter(t => t.isRunning);
    if (runningTimers.length > 0) {
      const autoSaveInterval = setInterval(() => {
        saveEnhancedTimerState(timers, 'auto-save-interval');
      }, 10000); // Save every 10 seconds

      return () => clearInterval(autoSaveInterval);
    }
  }, [timers, saveEnhancedTimerState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Enhanced timer effects cleanup');
      saveEnhancedTimerState(timersRef.current, 'cleanup');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [saveEnhancedTimerState]);

  return { isPageVisibleRef };
};
