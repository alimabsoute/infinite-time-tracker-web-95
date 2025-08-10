import { useCallback, useEffect, useRef } from 'react';
import { Timer } from '../types';
import { useTimerPersistenceRobust } from './useTimerPersistenceRobust';

interface BrowserEventHandlers {
  onVisibilityChange: (isVisible: boolean) => void;
  onBeforeUnload: () => void;
  onPageHide: () => void;
  onPageShow: () => void;
  onFocus: () => void;
  onBlur: () => void;
}

interface UseTimerBrowserEventsRobustProps {
  timers: Timer[];
  onTimersRestore?: (timers: Timer[]) => void;
}

export const useTimerBrowserEventsRobust = ({ 
  timers, 
  onTimersRestore 
}: UseTimerBrowserEventsRobustProps) => {
  const { 
    persistTimerState, 
    loadPersistedState, 
    syncToDatabase,
    startAutomaticPersistence 
  } = useTimerPersistenceRobust();
  
  const handlersRef = useRef<BrowserEventHandlers | null>(null);
  const isPageVisibleRef = useRef(true);
  const lastPersistRef = useRef(0);

  // Immediate state persistence (called on critical events)
  const persistImmediately = useCallback((reason: string) => {
    const now = Date.now();
    if (now - lastPersistRef.current < 1000) return; // Throttle to once per second
    
    persistTimerState(timers);
    syncToDatabase(timers);
    lastPersistRef.current = now;
    console.log(`💾 Emergency persist: ${reason}`);
  }, [timers, persistTimerState, syncToDatabase]);

  // Handle page becoming visible
  const handlePageVisible = useCallback(() => {
    console.log('👁️ Page became visible - checking for timer restoration');
    isPageVisibleRef.current = true;
    
    const { runningTimerIds, timeAdjustments } = loadPersistedState();
    
    if (runningTimerIds.length > 0 && onTimersRestore) {
      console.log(`🔄 Restoring ${runningTimerIds.length} persisted running timers`);
      
      // Create updated timers with accumulated time
      const updatedTimers = timers.map(timer => {
        if (runningTimerIds.includes(timer.id)) {
          const adjustedTime = timeAdjustments.get(timer.id) || timer.elapsedTime;
          return {
            ...timer,
            isRunning: true,
            elapsedTime: adjustedTime,
            sessionStartTime: new Date(), // Reset session start time
            currentSessionId: `session-${Date.now()}-${timer.id}`
          };
        }
        return timer;
      });
      
      onTimersRestore(updatedTimers);
    }
    
    // Restart automatic persistence for any running timers
    const runningTimers = timers.filter(t => t.isRunning);
    if (runningTimers.length > 0) {
      startAutomaticPersistence(timers);
    }
  }, [timers, loadPersistedState, onTimersRestore, startAutomaticPersistence]);

  // Handle page becoming hidden
  const handlePageHidden = useCallback(() => {
    console.log('👻 Page became hidden - persisting timer state');
    isPageVisibleRef.current = false;
    persistImmediately('page hidden');
  }, [persistImmediately]);

  // Browser event handlers
  const browserEventHandlers: BrowserEventHandlers = {
    onVisibilityChange: (isVisible: boolean) => {
      if (isVisible) {
        handlePageVisible();
      } else {
        handlePageHidden();
      }
    },

    onBeforeUnload: () => {
      console.log('🚪 Before unload - final timer persistence');
      persistImmediately('before unload');
    },

    onPageHide: () => {
      console.log('📱 Page hide event - persisting state');
      persistImmediately('page hide');
    },

    onPageShow: () => {
      console.log('📱 Page show event - checking restoration');
      handlePageVisible();
    },

    onFocus: () => {
      console.log('🎯 Window focus - checking timer continuity');
      if (isPageVisibleRef.current) {
        handlePageVisible();
      }
    },

    onBlur: () => {
      console.log('😴 Window blur - persisting state');
      persistImmediately('window blur');
    }
  };

  // Store handlers in ref for cleanup
  handlersRef.current = browserEventHandlers;

  // Set up browser event listeners
  useEffect(() => {
    const handlers = handlersRef.current;
    if (!handlers) return;

    // Visibility change
    const handleVisibilityChange = () => {
      handlers.onVisibilityChange(!document.hidden);
    };

    // Before unload
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      handlers.onBeforeUnload();
      // Don't prevent unload, just persist
    };

    // Page lifecycle events
    const handlePageHide = (event: PageTransitionEvent) => {
      handlers.onPageHide();
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      handlers.onPageShow();
    };

    // Window focus events
    const handleFocus = () => {
      handlers.onFocus();
    };

    const handleBlur = () => {
      handlers.onBlur();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    console.log('🛡️ Robust browser event protection activated');

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      console.log('🔌 Browser event listeners cleaned up');
    };
  }, []);

  return {
    persistImmediately,
    isPageVisible: isPageVisibleRef.current
  };
};