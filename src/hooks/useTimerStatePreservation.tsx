import { useEffect, useRef } from 'react';
import { Timer } from '../types';
import { useBrowserEvents } from './useBrowserEvents';

interface UseTimerStatePreservationProps {
  timersRef: React.MutableRefObject<Timer[]>;
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
  isPageVisibleRef: React.MutableRefObject<boolean>;
}

/**
 * Simplified hook that focuses ONLY on preserving timer running states
 * without interfering with timer state through restoration or validation
 */
export const useTimerStatePreservation = ({ 
  timersRef, 
  setTimers, 
  isPageVisibleRef 
}: UseTimerStatePreservationProps) => {
  const lastSaveRef = useRef(0);

  // Simple save function that doesn't restore or validate
  const saveCurrentState = (reason: string) => {
    try {
      const currentTimers = timersRef.current;
      if (!currentTimers || currentTimers.length === 0) return;

      const runningTimers = currentTimers.filter(t => t.isRunning);
      if (runningTimers.length === 0) return;

      console.log(`💾 Saving ${runningTimers.length} running timers (${reason})`);
      
      const stateData = {
        timers: runningTimers.map(timer => ({
          id: timer.id,
          elapsedTime: timer.elapsedTime,
          isRunning: timer.isRunning,
          snapshotTime: Date.now()
        })),
        timestamp: Date.now(),
        reason
      };

      localStorage.setItem('timer-preservation-state', JSON.stringify(stateData));
      lastSaveRef.current = Date.now();
    } catch (error) {
      console.error('❌ Error saving timer state:', error);
    }
  };

  // Simple browser event handlers that only save, never restore
  const browserEventHandlers = {
    onVisibilityChange: (isVisible: boolean) => {
      isPageVisibleRef.current = isVisible;
      console.log(`👁️ Visibility: ${isVisible ? 'visible' : 'hidden'}`);
      
      if (isVisible) {
        // Page became visible - just log running timers, don't restore
        const runningTimers = timersRef.current.filter(t => t.isRunning);
        console.log(`🏃 Page visible: ${runningTimers.length} timers running`);
      } else {
        // Page became hidden - save current state
        saveCurrentState('visibility-hidden');
      }
    },

    onBeforeUnload: () => {
      saveCurrentState('before-unload');
    },

    onPageHide: () => {
      saveCurrentState('page-hide');
    },

    onPageShow: () => {
      // Just log, don't restore
      const runningTimers = timersRef.current.filter(t => t.isRunning);
      console.log(`👁️ Page show: ${runningTimers.length} timers running`);
    },

    onFocus: () => {
      // Just log, don't restore
      const runningTimers = timersRef.current.filter(t => t.isRunning);
      console.log(`🎯 Focus: ${runningTimers.length} timers running`);
    },

    onBlur: () => {
      // Throttled save on blur
      const now = Date.now();
      if (now - lastSaveRef.current > 5000) { // Only save every 5 seconds
        saveCurrentState('blur');
      }
    }
  };

  // Register browser events
  useBrowserEvents(browserEventHandlers);

  // Auto-save running timers periodically (but don't restore)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastSaveRef.current > 30000) { // Save every 30 seconds
        const runningTimers = timersRef.current.filter(t => t.isRunning);
        if (runningTimers.length > 0) {
          saveCurrentState('auto-save');
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      saveCurrentState('cleanup');
    };
  }, []);
};