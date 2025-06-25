
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

  // Browser event handlers
  const browserEventHandlers = {
    onVisibilityChange: useCallback((isVisible: boolean) => {
      isPageVisibleRef.current = isVisible;
      
      if (!isVisible) {
        saveTimerState(timersRef.current, 'visibility');
        batchSyncTimers(timersRef.current, true);
      } else {
        const persistenceData = loadTimerState();
        if (persistenceData) {
          setTimers(prevTimers => {
            const restoredTimers = restoreTimerElapsedTime(prevTimers, persistenceData);
            batchSyncTimers(restoredTimers, true);
            return restoredTimers;
          });
        }
      }
    }, [saveTimerState, batchSyncTimers, loadTimerState, restoreTimerElapsedTime]),

    onBeforeUnload: useCallback(() => {
      saveTimerState(timersRef.current, 'beforeunload');
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
    }, [saveTimerState]),

    onPageHide: useCallback(() => {
      saveTimerState(timersRef.current, 'pagehide');
      batchSyncTimers(timersRef.current, true);
    }, [saveTimerState, batchSyncTimers]),

    onPageShow: useCallback(() => {
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
      const persistenceData = loadTimerState();
      if (persistenceData) {
        setTimers(prevTimers => restoreTimerElapsedTime(prevTimers, persistenceData));
      }
    }, [loadTimerState, restoreTimerElapsedTime]),

    onBlur: useCallback(() => {
      saveTimerState(timersRef.current, 'blur');
    }, [saveTimerState])
  };

  // Register browser event handlers
  useBrowserEvents(browserEventHandlers);

  // Auto-save timer state periodically
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastSave = now - lastAutoSaveRef.current;
      
      if (timeSinceLastSave > 30000) {
        const runningTimers = timersRef.current.filter(t => t.isRunning);
        if (runningTimers.length > 0) {
          saveTimerState(timersRef.current, 'manual');
          lastAutoSaveRef.current = now;
        }
      }
    }, 5000);

    return () => clearInterval(autoSaveInterval);
  }, [saveTimerState]);

  // Update running timers every second
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
          if (now - lastAutoSaveRef.current > 10000) {
            saveTimerState(updatedTimers, 'manual');
            lastAutoSaveRef.current = now;
          }
          
          if (isPageVisibleRef.current && now % 5000 < 1000) {
            batchSyncTimers(updatedTimers);
          }
        }

        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user, saveTimerState, batchSyncTimers]);

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
