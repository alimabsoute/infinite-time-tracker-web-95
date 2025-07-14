import { useCallback, useRef } from 'react';
import { Timer } from '../types';
import { useTimerStateValidator } from './useTimerStateValidator';

interface TimerStateSnapshot {
  id: string;
  elapsedTime: number;
  isRunning: boolean;
  snapshotTime: number;
  lastValidatedTime: number;
  sessionId?: string;
}

interface TimerPersistenceData {
  timers: TimerStateSnapshot[];
  timestamp: number;
  reason: string;
  validationHash: string;
  version: string;
}

export const useTimerPersistenceFixed = () => {
  const { validateTimerState, autoCorrectTimerState } = useTimerStateValidator();
  const persistenceKeyRef = useRef('phynx_timer_persistence_v3_fixed');
  const lastSaveTimeRef = useRef(0);
  const saveThrottleMs = 1000;

  // Generate a hash for validation
  const generateValidationHash = useCallback((timers: TimerStateSnapshot[]): string => {
    const hashData = timers.map(t => `${t.id}-${t.isRunning}-${t.elapsedTime}`).join('|');
    return btoa(hashData).slice(0, 16);
  }, []);

  const saveTimerState = useCallback(async (timers: Timer[], reason: string = 'manual') => {
    const now = Date.now();
    
    // Critical saves bypass throttling
    const isCriticalSave = ['beforeunload', 'pagehide', 'visibility-hidden', 'cleanup'].includes(reason);
    if (!isCriticalSave && now - lastSaveTimeRef.current < saveThrottleMs) {
      return;
    }

    try {
      // Validate and correct timer state before saving
      const correctedTimers = await autoCorrectTimerState(timers);
      const runningTimers = correctedTimers.filter(timer => timer.isRunning);
      
      if (runningTimers.length === 0) {
        // Clear persistence data if no running timers
        localStorage.removeItem(persistenceKeyRef.current);
        sessionStorage.removeItem(persistenceKeyRef.current);
        console.log('🧹 Cleared timer persistence (no running timers)');
        return correctedTimers;
      }

      // Create snapshots with validation data
      const snapshots: TimerStateSnapshot[] = runningTimers.map(timer => ({
        id: timer.id,
        elapsedTime: timer.elapsedTime,
        isRunning: timer.isRunning,
        snapshotTime: now,
        lastValidatedTime: now,
        sessionId: timer.currentSessionId
      }));

      const persistenceData: TimerPersistenceData = {
        timers: snapshots,
        timestamp: now,
        reason,
        validationHash: generateValidationHash(snapshots),
        version: '3.0.0'
      };

      // Save to both storages with error handling
      const dataString = JSON.stringify(persistenceData);
      
      try {
        localStorage.setItem(persistenceKeyRef.current, dataString);
      } catch (localStorageError) {
        console.warn('⚠️ localStorage save failed, using sessionStorage only:', localStorageError);
      }
      
      try {
        sessionStorage.setItem(persistenceKeyRef.current, dataString);
      } catch (sessionStorageError) {
        console.error('❌ Both localStorage and sessionStorage failed:', sessionStorageError);
        return correctedTimers;
      }
      
      lastSaveTimeRef.current = now;
      
      console.log(`💾 Fixed persistence save (${reason}):`, {
        count: runningTimers.length,
        timerIds: runningTimers.map(t => t.id),
        validationHash: persistenceData.validationHash,
        correctionsMade: timers.length !== correctedTimers.length || 
                        timers.some((t, i) => t.isRunning !== correctedTimers[i]?.isRunning)
      });

      return correctedTimers;
    } catch (error) {
      console.error('❌ Failed to save timer state:', error);
      return timers;
    }
  }, [autoCorrectTimerState, generateValidationHash]);

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
      
      // Version check
      if (!persistenceData.version || persistenceData.version !== '3.0.0') {
        console.log('🗑️ Old version persistence data, clearing');
        localStorage.removeItem(persistenceKeyRef.current);
        sessionStorage.removeItem(persistenceKeyRef.current);
        return null;
      }

      // Validate hash integrity
      const expectedHash = generateValidationHash(persistenceData.timers);
      if (persistenceData.validationHash !== expectedHash) {
        console.error('❌ Persistence data integrity check failed, clearing');
        localStorage.removeItem(persistenceKeyRef.current);
        sessionStorage.removeItem(persistenceKeyRef.current);
        return null;
      }
      
      // Check age - maximum 4 hours for running timers
      const maxAge = 4 * 60 * 60 * 1000; // 4 hours
      const age = Date.now() - persistenceData.timestamp;
      
      if (age > maxAge) {
        console.log(`🗑️ Persistence data too old (${Math.round(age / 1000 / 60)} minutes), clearing`);
        localStorage.removeItem(persistenceKeyRef.current);
        sessionStorage.removeItem(persistenceKeyRef.current);
        return null;
      }

      console.log('📥 Loaded validated persistence data:', {
        count: persistenceData.timers.length,
        age: Math.round(age / 1000) + 's',
        reason: persistenceData.reason,
        storage: storageType,
        hash: persistenceData.validationHash
      });

      return persistenceData;
    } catch (error) {
      console.error('❌ Failed to load timer state:', error);
      // Clean up corrupted data
      localStorage.removeItem(persistenceKeyRef.current);
      sessionStorage.removeItem(persistenceKeyRef.current);
      return null;
    }
  }, [generateValidationHash]);

  const restoreTimerElapsedTime = useCallback(async (
    timers: Timer[], 
    persistenceData: TimerPersistenceData
  ): Promise<Timer[]> => {
    console.log('🔄 Starting intelligent timer restoration...');
    
    // Validate current timer state first
    const validation = await validateTimerState(timers, true);
    if (!validation.isValid && validation.correctedTimers) {
      timers = validation.correctedTimers;
      console.log('🔧 Applied corrections before restoration');
    }
    
    const currentTime = Date.now();
    const timeSinceSnapshot = currentTime - persistenceData.timestamp;
    
    // Don't restore if data is too old (more than 30 minutes)
    if (timeSinceSnapshot > 30 * 60 * 1000) {
      console.log('⚠️ Persistence data too old for restoration');
      return timers;
    }
    
    return timers.map(timer => {
      const savedTimer = persistenceData.timers.find(saved => saved.id === timer.id);
      
      if (!savedTimer) {
        return timer;
      }

      // Critical check: Only restore if BOTH saved and current state show running
      if (!savedTimer.isRunning || !timer.isRunning) {
        if (savedTimer.isRunning && !timer.isRunning) {
          console.log(`⚠️ Persistence shows running but current state is stopped for ${timer.name} - keeping stopped`);
        }
        return timer;
      }

      // Calculate time elapsed since snapshot
      const additionalTime = currentTime - savedTimer.snapshotTime;
      
      // Sanity check: don't add unreasonable time
      if (additionalTime < 0 || additionalTime > timeSinceSnapshot + 10000) {
        console.warn(`⚠️ Unreasonable additional time for ${timer.name}: ${additionalTime}ms`);
        return timer;
      }

      const restoredElapsedTime = Math.max(0, savedTimer.elapsedTime + additionalTime);

      console.log(`⏱️ Restored ${timer.name}: ${savedTimer.elapsedTime}ms + ${additionalTime}ms = ${restoredElapsedTime}ms`);

      return {
        ...timer,
        elapsedTime: restoredElapsedTime
      };
    });
  }, [validateTimerState]);

  const clearTimerState = useCallback(() => {
    try {
      localStorage.removeItem(persistenceKeyRef.current);
      sessionStorage.removeItem(persistenceKeyRef.current);
      console.log('🧹 Cleared timer persistence data');
    } catch (error) {
      console.error('❌ Failed to clear timer state:', error);
    }
  }, []);

  return {
    saveTimerState,
    loadTimerState,
    clearTimerState,
    restoreTimerElapsedTime
  };
};