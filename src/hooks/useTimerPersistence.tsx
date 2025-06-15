
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
  reason: 'visibility' | 'beforeunload' | 'pagehide' | 'blur' | 'manual';
}

export const useTimerPersistence = () => {
  const persistenceKeyRef = useRef('phynx_timer_persistence');
  const lastSaveTimeRef = useRef(0);
  const saveThrottleMs = 1000; // Throttle saves to once per second

  const saveTimerState = useCallback((timers: Timer[], reason: TimerPersistenceData['reason'] = 'manual') => {
    const now = Date.now();
    
    // Throttle saves except for critical events
    const isCriticalSave = reason === 'beforeunload' || reason === 'pagehide';
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

      localStorage.setItem(persistenceKeyRef.current, JSON.stringify(persistenceData));
      lastSaveTimeRef.current = now;
      
      console.log(`💾 Saved timer state (${reason}):`, {
        count: runningTimers.length,
        timerIds: runningTimers.map(t => t.id),
        timestamp: new Date(now).toISOString()
      });
    } catch (error) {
      console.error('❌ Failed to save timer state:', error);
    }
  }, []);

  const loadTimerState = useCallback((): TimerPersistenceData | null => {
    try {
      const savedData = localStorage.getItem(persistenceKeyRef.current);
      if (!savedData) return null;

      const persistenceData: TimerPersistenceData = JSON.parse(savedData);
      
      // Check if the data is too old (more than 24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      const age = Date.now() - persistenceData.timestamp;
      
      if (age > maxAge) {
        console.log('🗑️ Timer persistence data too old, clearing');
        localStorage.removeItem(persistenceKeyRef.current);
        return null;
      }

      console.log('📥 Loaded timer persistence data:', {
        count: persistenceData.timers.length,
        age: Math.round(age / 1000) + 's',
        reason: persistenceData.reason
      });

      return persistenceData;
    } catch (error) {
      console.error('❌ Failed to load timer state:', error);
      localStorage.removeItem(persistenceKeyRef.current);
      return null;
    }
  }, []);

  const clearTimerState = useCallback(() => {
    try {
      localStorage.removeItem(persistenceKeyRef.current);
      console.log('🧹 Cleared timer persistence data');
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
        newElapsed: Math.round(restoredElapsedTime / 1000) + 's'
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
