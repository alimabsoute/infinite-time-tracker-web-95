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
  reason: 'visibility' | 'beforeunload' | 'pagehide' | 'blur' | 'manual' | 'auto-save' | 'timer-update' | 'cleanup' | 
          'visibility-fallback' | 'beforeunload-fallback' | 'pagehide-fallback' | 'blur-fallback' | 'manual-fallback' | 'auto-save-fallback' | 'timer-update-fallback' | 'cleanup-fallback';
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
            reason: `${reason}-fallback` as TimerPersistenceData['reason']
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

  // Restore elapsed time for timers based on saved data with validation
  const restoreTimerElapsedTime = useCallback((timers: Timer[], persistenceData: TimerPersistenceData): Timer[] => {
    console.log('🔄 Restoring timer elapsed time from persistence data');
    console.log('📊 Persistence data:', persistenceData);
    
    const currentTime = Date.now();
    const timeSinceSnapshot = currentTime - persistenceData.timestamp;
    console.log('⏰ Time since snapshot:', timeSinceSnapshot, 'ms');
    
    // Don't restore if data is too old (more than 1 hour)
    if (timeSinceSnapshot > 3600000) {
      console.log('⚠️ Persistence data too old, skipping restoration');
      return timers;
    }
    
    return timers.map(timer => {
      const savedTimer = persistenceData.timers.find(saved => saved.id === timer.id);
      
      if (!savedTimer || !savedTimer.isRunning) {
        return timer;
      }

      // Only restore if the timer is currently marked as running in local state
      // This prevents restoring paused timers that shouldn't be running
      if (!timer.isRunning) {
        console.log(`⚠️ Skipping restoration for timer ${timer.name} - not currently running`);
        return timer;
      }

      // Calculate time elapsed since the snapshot
      const additionalTime = currentTime - savedTimer.snapshotTime;
      const restoredElapsedTime = savedTimer.elapsedTime + additionalTime;

      console.log(`⏱️ Timer ${timer.name}: ${savedTimer.elapsedTime} + ${additionalTime} = ${restoredElapsedTime}`);

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
