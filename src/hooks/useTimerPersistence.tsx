
import { useCallback, useRef } from 'react';
import { Timer } from '../types';

interface TimerStateSnapshot {
  id: string;
  elapsedTime: number;
  isRunning: boolean;
  snapshotTime: number;
}

interface TimerPersistenceData {
  timers: TimerStateSnapshot[];
  timestamp: number;
  reason: 'visibility' | 'beforeunload' | 'pagehide' | 'blur' | 'manual' | 'auto-save' | 'timer-update' | 'cleanup';
}

export const useTimerPersistence = () => {
  const persistenceKeyRef = useRef('phynx_timer_persistence_v2');
  const lastSaveTimeRef = useRef(0);
  const saveThrottleMs = 2000; // Reduced throttle for better persistence

  const saveTimerState = useCallback((timers: Timer[], reason: TimerPersistenceData['reason'] = 'manual') => {
    const now = Date.now();
    
    // Allow more frequent saves for critical events
    const isCriticalSave = reason === 'beforeunload' || reason === 'pagehide' || reason === 'visibility' || reason === 'cleanup';
    if (!isCriticalSave && now - lastSaveTimeRef.current < saveThrottleMs) {
      return;
    }

    try {
      const runningTimers = timers.filter(timer => timer.isRunning);
      
      if (runningTimers.length === 0) {
        // No running timers, clear any existing persistence data
        localStorage.removeItem(persistenceKeyRef.current);
        console.log('🧹 Cleared timer persistence (no running timers)');
        return;
      }

      const persistenceData: TimerPersistenceData = {
        timers: runningTimers.map(timer => ({
          id: timer.id,
          elapsedTime: timer.elapsedTime,
          isRunning: timer.isRunning,
          snapshotTime: now
        })),
        timestamp: now,
        reason
      };

      // Use both localStorage and sessionStorage for redundancy
      const dataString = JSON.stringify(persistenceData);
      localStorage.setItem(persistenceKeyRef.current, dataString);
      sessionStorage.setItem(persistenceKeyRef.current, dataString);
      
      lastSaveTimeRef.current = now;
      
      console.log(`💾 Enhanced save timer state (${reason}):`, {
        count: runningTimers.length,
        timerIds: runningTimers.map(t => t.id),
        timestamp: new Date(now).toISOString(),
        storage: 'localStorage + sessionStorage'
      });
    } catch (error) {
      console.error('❌ Failed to save timer state:', error);
      // Fallback: try to save to sessionStorage only
      try {
        const runningTimers = timers.filter(timer => timer.isRunning);
        if (runningTimers.length > 0) {
          const fallbackData: TimerPersistenceData = {
            timers: runningTimers.map(timer => ({
              id: timer.id,
              elapsedTime: timer.elapsedTime,
              isRunning: timer.isRunning,
              snapshotTime: now
            })),
            timestamp: now,
            reason: `${reason}-fallback`
          };
          sessionStorage.setItem(persistenceKeyRef.current, JSON.stringify(fallbackData));
          console.log('💾 Fallback save to sessionStorage successful');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback save also failed:', fallbackError);
      }
    }
  }, []);

  const loadTimerState = useCallback((): TimerPersistenceData | null => {
    try {
      // Try localStorage first, then sessionStorage
      let savedData = localStorage.getItem(persistenceKeyRef.current);
      let storageType = 'localStorage';
      
      if (!savedData) {
        savedData = sessionStorage.getItem(persistenceKeyRef.current);
        storageType = 'sessionStorage';
      }
      
      if (!savedData) {
        console.log('📥 No timer persistence data found');
        return null;
      }

      const persistenceData: TimerPersistenceData = JSON.parse(savedData);
      
      // Check if the data is too old (more than 7 days instead of 24 hours)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      const age = Date.now() - persistenceData.timestamp;
      
      if (age > maxAge) {
        console.log('🗑️ Timer persistence data too old, clearing');
        localStorage.removeItem(persistenceKeyRef.current);
        sessionStorage.removeItem(persistenceKeyRef.current);
        return null;
      }

      console.log('📥 Loaded timer persistence data:', {
        count: persistenceData.timers.length,
        age: Math.round(age / 1000) + 's',
        reason: persistenceData.reason,
        storage: storageType
      });

      return persistenceData;
    } catch (error) {
      console.error('❌ Failed to load timer state:', error);
      // Clean up corrupted data
      localStorage.removeItem(persistenceKeyRef.current);
      sessionStorage.removeItem(persistenceKeyRef.current);
      return null;
    }
  }, []);

  const clearTimerState = useCallback(() => {
    try {
      localStorage.removeItem(persistenceKeyRef.current);
      sessionStorage.removeItem(persistenceKeyRef.current);
      console.log('🧹 Cleared timer persistence data from both storages');
    } catch (error) {
      console.error('❌ Failed to clear timer state:', error);
    }
  }, []);

  const restoreTimerElapsedTime = useCallback((timers: Timer[], persistenceData: TimerPersistenceData): Timer[] => {
    const currentTime = Date.now();
    
    return timers.map(timer => {
      const savedTimer = persistenceData.timers.find(saved => saved.id === timer.id);
      
      if (!savedTimer || !timer.isRunning) {
        return timer;
      }

      // Calculate time elapsed since the snapshot
      const timeSinceSnapshot = currentTime - savedTimer.snapshotTime;
      const restoredElapsedTime = savedTimer.elapsedTime + timeSinceSnapshot;

      console.log(`⏰ Restoring timer ${timer.id}:`, {
        savedElapsed: Math.round(savedTimer.elapsedTime / 1000) + 's',
        timeSinceSnapshot: Math.round(timeSinceSnapshot / 1000) + 's',
        newElapsed: Math.round(restoredElapsedTime / 1000) + 's',
        reason: persistenceData.reason
      });

      return {
        ...timer,
        elapsedTime: restoredElapsedTime
      };
    });
  }, []);

  return {
    saveTimerState,
    loadTimerState,
    clearTimerState,
    restoreTimerElapsedTime
  };
};
