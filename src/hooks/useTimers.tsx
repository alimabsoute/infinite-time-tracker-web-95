
import { useState, useEffect, useCallback, useRef } from "react";
import { Timer } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "./useNotifications";
import { useBrowserEvents } from "./useBrowserEvents";
import { useTimerPersistence } from "./useTimerPersistence";
import { useTimerSync } from "./useTimerSync";
import { useTimerState } from "./useTimerState";
import { useTimerActions } from "./useTimerActions";
import { useTimerRealtime } from "./useTimerRealtime";

export const useTimers = () => {
  const [confettiTrigger, setConfettiTrigger] = useState<{ x: number; y: number; id: string } | null>(null);
  const [celebrationTrigger, setCelebrationTrigger] = useState<{ type: 'fireworks' | 'sparkles' | null }>({ type: null });
  const confettiTimeoutRef = useRef<NodeJS.Timeout>();
  const celebrationTimeoutRef = useRef<NodeJS.Timeout>();
  const { user } = useAuth();
  const { updateTimerData } = useNotifications();
  
  // Persistence and sync hooks
  const { saveTimerState, loadTimerState, restoreTimerElapsedTime } = useTimerPersistence();
  const { batchSyncTimers } = useTimerSync();
  
  // Core state management
  const { timers, setTimers, loading, timersRef } = useTimerState();
  
  // Refs for tracking state
  const isPageVisibleRef = useRef(true);
  const lastAutoSaveRef = useRef(0);
  const syncIntervalRef = useRef<NodeJS.Timeout>();

  // Update notification data for running timers
  useEffect(() => {
    timers.forEach(timer => {
      updateTimerData(timer.id, timer.name, timer.elapsedTime, timer.isRunning);
    });
  }, [timers, updateTimerData]);

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

  // Timer actions
  const timerActions = useTimerActions({ 
    timers, 
    setTimers, 
    setConfettiTrigger, 
    setCelebrationTrigger,
    clearConfettiTrigger 
  });

  // Real-time updates
  useTimerRealtime({ timers, setTimers });

  // Enhanced persistence with more frequent saves
  const enhancedSaveTimerState = useCallback((reason: string) => {
    const runningTimers = timersRef.current.filter(t => t.isRunning);
    if (runningTimers.length > 0) {
      saveTimerState(timersRef.current, reason as any);
      console.log(`💾 Enhanced save: ${runningTimers.length} running timers saved (${reason})`);
    }
  }, [saveTimerState]);

  // Browser event handlers with enhanced persistence
  const browserEventHandlers = {
    onVisibilityChange: useCallback((isVisible: boolean) => {
      console.log(`👁️ Visibility changed: ${isVisible ? 'visible' : 'hidden'}`);
      isPageVisibleRef.current = isVisible;
      
      if (!isVisible) {
        // Save immediately when page becomes hidden
        enhancedSaveTimerState('visibility');
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
    }, [enhancedSaveTimerState, batchSyncTimers, loadTimerState, restoreTimerElapsedTime]),

    onBeforeUnload: useCallback(() => {
      console.log('⚠️ Before unload - saving timer state');
      enhancedSaveTimerState('beforeunload');
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
    }, [enhancedSaveTimerState]),

    onPageHide: useCallback(() => {
      console.log('👋 Page hide - saving timer state');
      enhancedSaveTimerState('pagehide');
      batchSyncTimers(timersRef.current, true);
    }, [enhancedSaveTimerState, batchSyncTimers]),

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
    }, [loadTimerState, restoreTimerElapsedTime, batchSyncTimers]),

    onFocus: useCallback(() => {
      console.log('🎯 Window focus - checking for timer state');
      const persistenceData = loadTimerState();
      if (persistenceData) {
        setTimers(prevTimers => restoreTimerElapsedTime(prevTimers, persistenceData));
      }
    }, [loadTimerState, restoreTimerElapsedTime]),

    onBlur: useCallback(() => {
      console.log('😴 Window blur - saving timer state');
      enhancedSaveTimerState('blur');
    }, [enhancedSaveTimerState])
  };

  // Register browser event handlers
  useBrowserEvents(browserEventHandlers);

  // Enhanced auto-save with more frequent intervals
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastSave = now - lastAutoSaveRef.current;
      
      // Save every 10 seconds instead of 30 seconds for better persistence
      if (timeSinceLastSave > 10000) {
        const runningTimers = timersRef.current.filter(t => t.isRunning);
        if (runningTimers.length > 0) {
          enhancedSaveTimerState('auto-save');
          lastAutoSaveRef.current = now;
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(autoSaveInterval);
  }, [enhancedSaveTimerState]);

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

        const runningTimers = updatedTimers.filter(t => t.isRunning);
        if (runningTimers.length > 0) {
          const now = Date.now();
          // Save more frequently when timers are running
          if (now - lastAutoSaveRef.current > 5000) {
            enhancedSaveTimerState('timer-update');
            lastAutoSaveRef.current = now;
          }
          
          // Sync to database every 10 seconds when page is visible
          if (isPageVisibleRef.current && now % 10000 < 1000) {
            batchSyncTimers(updatedTimers);
          }
        }

        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user, enhancedSaveTimerState, batchSyncTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      // Final save on cleanup
      const runningTimers = timersRef.current.filter(t => t.isRunning);
      if (runningTimers.length > 0) {
        saveTimerState(timersRef.current, 'cleanup');
      }
    };
  }, [saveTimerState]);

  return {
    timers,
    loading,
    ...timerActions,
    confettiTrigger,
    celebrationTrigger,
    clearConfettiTrigger,
    clearCelebrationTrigger,
  };
};
