
import { useCallback } from 'react';
import { Timer } from '../types';
import { useBrowserEvents } from './useBrowserEvents';
import { useTimerPersistenceEnhanced } from './useTimerPersistenceEnhanced';

interface UseTimerBrowserEventsProps {
  timersRef: React.MutableRefObject<Timer[]>;
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
  isPageVisibleRef: React.MutableRefObject<boolean>;
}

export const useTimerBrowserEvents = ({ 
  timersRef, 
  setTimers, 
  isPageVisibleRef 
}: UseTimerBrowserEventsProps) => {
  const {
    enhancedSaveTimerState,
    loadTimerState,
    restoreTimerElapsedTime,
    batchSyncTimers
  } = useTimerPersistenceEnhanced();

  // Browser event handlers with enhanced persistence
  const browserEventHandlers = {
    onVisibilityChange: useCallback((isVisible: boolean) => {
      console.log(`👁️ Visibility changed: ${isVisible ? 'visible' : 'hidden'}`);
      isPageVisibleRef.current = isVisible;
      
      if (!isVisible) {
        // Save immediately when page becomes hidden
        enhancedSaveTimerState(timersRef, 'visibility');
        batchSyncTimers(timersRef.current, true);
      } else {
        // Restore when page becomes visible
        const persistenceData = loadTimerState();
        if (persistenceData) {
          console.log('🔄 Restoring timers from persistence on visibility change');
          setTimers(prevTimers => {
            const restoredTimers = restoreTimerElapsedTime(prevTimers, persistenceData);
            batchSyncTimers(restoredTimers, true);
            return restoredTimers;
          });
        }
      }
    }, [enhancedSaveTimerState, batchSyncTimers, loadTimerState, restoreTimerElapsedTime, setTimers, timersRef, isPageVisibleRef]),

    onBeforeUnload: useCallback(() => {
      console.log('⚠️ Before unload - saving timer state');
      enhancedSaveTimerState(timersRef, 'beforeunload');
      const runningTimers = timersRef.current.filter(t => t.isRunning);
      if (runningTimers.length > 0) {
        const syncData = runningTimers.map(timer => ({
          id: timer.id,
          elapsed_time: timer.elapsedTime,
          is_running: timer.isRunning
        }));
        
        try {
          navigator.sendBeacon('/api/sync-timers', JSON.stringify(syncData));
        } catch (error) {
          console.error('Failed to send beacon:', error);
        }
      }
    }, [enhancedSaveTimerState, timersRef]),

    onPageHide: useCallback(() => {
      console.log('👋 Page hide - saving timer state');
      enhancedSaveTimerState(timersRef, 'pagehide');
      batchSyncTimers(timersRef.current, true);
    }, [enhancedSaveTimerState, batchSyncTimers, timersRef]),

    onPageShow: useCallback(() => {
      console.log('👁️ Page show - restoring timer state');
      const persistenceData = loadTimerState();
      if (persistenceData) {
        setTimers(prevTimers => {
          const restoredTimers = restoreTimerElapsedTime(prevTimers, persistenceData);
          batchSyncTimers(restoredTimers, true);
          return restoredTimers;
        });
      }
    }, [loadTimerState, restoreTimerElapsedTime, batchSyncTimers, setTimers]),

    onFocus: useCallback(() => {
      console.log('🎯 Window focus - checking for timer state');
      const persistenceData = loadTimerState();
      if (persistenceData) {
        setTimers(prevTimers => restoreTimerElapsedTime(prevTimers, persistenceData));
      }
    }, [loadTimerState, restoreTimerElapsedTime, setTimers]),

    onBlur: useCallback(() => {
      console.log('😴 Window blur - saving timer state');
      enhancedSaveTimerState(timersRef, 'blur');
    }, [enhancedSaveTimerState, timersRef])
  };

  // Register browser event handlers
  useBrowserEvents(browserEventHandlers);
};
