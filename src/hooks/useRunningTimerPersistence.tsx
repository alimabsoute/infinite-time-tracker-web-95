
import { useCallback, useRef } from 'react';

interface RunningTimerData {
  id: string;
  startTime: number;
  name: string;
}

interface PersistedRunningState {
  runningTimers: RunningTimerData[];
  timestamp: number;
  sessionId: string;
}

const STORAGE_KEY = 'phynx-running-timers';
const SESSION_ID = `session-${Date.now()}-${Math.random()}`;

export const useRunningTimerPersistence = () => {
  const sessionIdRef = useRef(SESSION_ID);

  // Save running timers to localStorage
  const saveRunningTimers = useCallback((runningTimers: { id: string; name: string }[]) => {
    try {
      if (runningTimers.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
        console.log('🗑️ Cleared running timers from storage (no running timers)');
        return;
      }

      const stateToSave: PersistedRunningState = {
        runningTimers: runningTimers.map(timer => ({
          id: timer.id,
          startTime: Date.now(),
          name: timer.name
        })),
        timestamp: Date.now(),
        sessionId: sessionIdRef.current
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      console.log(`💾 Saved ${runningTimers.length} running timers:`, runningTimers.map(t => t.name));
    } catch (error) {
      console.error('❌ Failed to save running timers:', error);
    }
  }, []);

  // Load running timers from localStorage
  const loadRunningTimers = useCallback((): string[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        console.log('📝 No persisted running timers found');
        return [];
      }

      const parsed: PersistedRunningState = JSON.parse(stored);
      const runningIds = parsed.runningTimers.map(t => t.id);
      
      console.log(`🔄 Loaded ${runningIds.length} running timer IDs from storage:`, parsed.runningTimers.map(t => t.name));
      return runningIds;
    } catch (error) {
      console.error('❌ Failed to load running timers:', error);
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }, []);

  // Clear running timers from localStorage
  const clearRunningTimers = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🧹 Cleared running timers from storage');
    } catch (error) {
      console.error('❌ Failed to clear running timers:', error);
    }
  }, []);

  return {
    saveRunningTimers,
    loadRunningTimers,
    clearRunningTimers
  };
};
