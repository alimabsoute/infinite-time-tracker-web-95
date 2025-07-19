
import { useCallback, useRef } from 'react';
import { Timer } from '../types';

interface TimerStateSnapshot {
  id: string;
  elapsedTime: number;
  isRunning: boolean;
  snapshotTime: number;
  sessionId?: string;
  sessionStartTime?: number;
}

interface EnhancedPersistenceData {
  timers: TimerStateSnapshot[];
  timestamp: number;
  sessionId: string;
  version: string;
}

export const useTimerPersistenceEnhanced = () => {
  const persistenceKeyRef = useRef('phynx_enhanced_timer_persistence_v1');
  const sessionIdRef = useRef(`session-${Date.now()}-${Math.random()}`);
  const lastSaveTimeRef = useRef(0);
  const saveThrottleMs = 2000; // Save every 2 seconds max

  // Save enhanced timer state with session tracking
  const saveEnhancedTimerState = useCallback((timers: Timer[], reason: string = 'auto') => {
    const now = Date.now();
    
    // Throttle saves unless it's a critical save
    const isCriticalSave = ['beforeunload', 'pagehide', 'visibility-hidden'].includes(reason);
    if (!isCriticalSave && now - lastSaveTimeRef.current < saveThrottleMs) {
      return;
    }

    try {
      const runningTimers = timers.filter(timer => timer.isRunning);
      
      if (runningTimers.length === 0) {
        // Clear persistence data if no running timers
        localStorage.removeItem(persistenceKeyRef.current);
        sessionStorage.removeItem(persistenceKeyRef.current);
        console.log('🧹 Cleared enhanced persistence (no running timers)');
        return;
      }

      // Create snapshots with current session data
      const snapshots: TimerStateSnapshot[] = runningTimers.map(timer => ({
        id: timer.id,
        elapsedTime: timer.elapsedTime,
        isRunning: timer.isRunning,
        snapshotTime: now,
        sessionId: timer.currentSessionId,
        sessionStartTime: timer.sessionStartTime?.getTime()
      }));

      const persistenceData: EnhancedPersistenceData = {
        timers: snapshots,
        timestamp: now,
        sessionId: sessionIdRef.current,
        version: '1.0.0'
      };

      const dataString = JSON.stringify(persistenceData);
      
      // Save to both storages for reliability
      try {
        localStorage.setItem(persistenceKeyRef.current, dataString);
      } catch (e) {
        console.warn('⚠️ localStorage save failed:', e);
      }
      
      try {
        sessionStorage.setItem(persistenceKeyRef.current, dataString);
      } catch (e) {
        console.warn('⚠️ sessionStorage save failed:', e);
      }
      
      lastSaveTimeRef.current = now;
      console.log(`💾 Enhanced persistence save (${reason}):`, {
        count: runningTimers.length,
        reason,
        sessionId: sessionIdRef.current
      });

    } catch (error) {
      console.error('❌ Failed to save enhanced timer state:', error);
    }
  }, []);

  // Load enhanced timer state
  const loadEnhancedTimerState = useCallback((): EnhancedPersistenceData | null => {
    try {
      // Try localStorage first, then sessionStorage
      let savedData = localStorage.getItem(persistenceKeyRef.current);
      let storageType = 'localStorage';
      
      if (!savedData) {
        savedData = sessionStorage.getItem(persistenceKeyRef.current);
        storageType = 'sessionStorage';
      }
      
      if (!savedData) {
        console.log('📥 No enhanced persistence data found');
        return null;
      }

      const persistenceData: EnhancedPersistenceData = JSON.parse(savedData);
      
      // Version check
      if (!persistenceData.version || persistenceData.version !== '1.0.0') {
        console.log('🗑️ Old version enhanced persistence data, clearing');
        localStorage.removeItem(persistenceKeyRef.current);
        sessionStorage.removeItem(persistenceKeyRef.current);
        return null;
      }
      
      // Check age - maximum 8 hours for running timers
      const maxAge = 8 * 60 * 60 * 1000; // 8 hours
      const age = Date.now() - persistenceData.timestamp;
      
      if (age > maxAge) {
        console.log(`🗑️ Enhanced persistence data too old (${Math.round(age / 1000 / 60)} minutes), clearing`);
        localStorage.removeItem(persistenceKeyRef.current);
        sessionStorage.removeItem(persistenceKeyRef.current);
        return null;
      }

      console.log('📥 Loaded enhanced persistence data:', {
        count: persistenceData.timers.length,
        age: Math.round(age / 1000) + 's',
        storage: storageType,
        sessionId: persistenceData.sessionId
      });

      return persistenceData;
    } catch (error) {
      console.error('❌ Failed to load enhanced timer state:', error);
      localStorage.removeItem(persistenceKeyRef.current);
      sessionStorage.removeItem(persistenceKeyRef.current);
      return null;
    }
  }, []);

  // Restore timer elapsed time with session-based calculation
  const restoreEnhancedTimerElapsedTime = useCallback((
    timers: Timer[], 
    persistenceData: EnhancedPersistenceData
  ): Timer[] => {
    console.log('🔄 Starting enhanced timer restoration...');
    
    const currentTime = Date.now();
    const timeSinceSnapshot = currentTime - persistenceData.timestamp;
    
    // More generous time limit for restoration (2 hours)
    if (timeSinceSnapshot > 2 * 60 * 60 * 1000) {
      console.log('⚠️ Enhanced persistence data too old for restoration');
      return timers;
    }
    
    return timers.map(timer => {
      const savedTimer = persistenceData.timers.find(saved => saved.id === timer.id);
      
      if (!savedTimer) {
        return timer;
      }

      // CRITICAL: Only restore if BOTH saved and current state show running
      if (!savedTimer.isRunning || !timer.isRunning) {
        console.log(`⚠️ Timer ${timer.name} not running in both states - skipping restoration`);
        return timer;
      }

      // Calculate time elapsed since snapshot
      const additionalTime = currentTime - savedTimer.snapshotTime;
      
      // Sanity check: don't add unreasonable time (max 2 hours)
      if (additionalTime < 0 || additionalTime > 2 * 60 * 60 * 1000) {
        console.warn(`⚠️ Unreasonable additional time for ${timer.name}: ${additionalTime}ms`);
        return timer;
      }

      // Calculate the restored elapsed time
      const restoredElapsedTime = Math.max(0, savedTimer.elapsedTime + additionalTime);

      // PROTECTION: Never reduce elapsed time
      const finalElapsedTime = Math.max(timer.elapsedTime, restoredElapsedTime);

      console.log(`⏱️ Enhanced restore ${timer.name}:`, {
        saved: savedTimer.elapsedTime,
        additional: additionalTime,
        restored: restoredElapsedTime,
        current: timer.elapsedTime,
        final: finalElapsedTime
      });

      return {
        ...timer,
        elapsedTime: finalElapsedTime
      };
    });
  }, []);

  const clearEnhancedTimerState = useCallback(() => {
    try {
      localStorage.removeItem(persistenceKeyRef.current);
      sessionStorage.removeItem(persistenceKeyRef.current);
      console.log('🧹 Cleared enhanced timer persistence data');
    } catch (error) {
      console.error('❌ Failed to clear enhanced timer state:', error);
    }
  }, []);

  return {
    saveEnhancedTimerState,
    loadEnhancedTimerState,
    clearEnhancedTimerState,
    restoreEnhancedTimerElapsedTime
  };
};
