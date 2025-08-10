import { useCallback, useRef, useEffect } from 'react';
import { Timer } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

interface PersistentTimerState {
  id: string;
  name: string;
  startTimestamp: number;
  lastKnownElapsed: number;
  sessionId: string;
  persistedAt: number;
}

interface PersistedAppState {
  runningTimers: PersistentTimerState[];
  appSessionId: string;
  timestamp: number;
}

const STORAGE_KEY = 'phynx-robust-timer-state';
const SYNC_INTERVAL = 30000; // Sync to database every 30 seconds
const PERSISTENCE_INTERVAL = 5000; // Save to localStorage every 5 seconds

export const useTimerPersistenceRobust = () => {
  const { user } = useAuth();
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const persistenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const appSessionId = useRef(`session-${Date.now()}-${Math.random()}`);
  const lastSyncRef = useRef<number>(0);

  // Save timer state to localStorage with detailed tracking
  const persistTimerState = useCallback((timers: Timer[]) => {
    try {
      const runningTimers = timers.filter(timer => timer.isRunning);
      
      if (runningTimers.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
        console.log('🧹 Cleared timer persistence (no running timers)');
        return;
      }

      const persistentState: PersistedAppState = {
        runningTimers: runningTimers.map(timer => ({
          id: timer.id,
          name: timer.name,
          startTimestamp: timer.sessionStartTime?.getTime() || Date.now(),
          lastKnownElapsed: timer.elapsedTime,
          sessionId: timer.currentSessionId || 'unknown',
          persistedAt: Date.now()
        })),
        appSessionId: appSessionId.current,
        timestamp: Date.now()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentState));
      console.log(`💾 Persisted ${runningTimers.length} running timers:`, 
        runningTimers.map(t => `${t.name} (${((Date.now() - (t.sessionStartTime?.getTime() || 0)) / 1000).toFixed(1)}s)`));
    } catch (error) {
      console.error('❌ Failed to persist timer state:', error);
    }
  }, []);

  // Load and restore timer state from localStorage
  const loadPersistedState = useCallback((): { 
    runningTimerIds: string[], 
    timeAdjustments: Map<string, number> 
  } => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        console.log('📝 No persisted timer state found');
        return { runningTimerIds: [], timeAdjustments: new Map() };
      }

      const parsed: PersistedAppState = JSON.parse(stored);
      const now = Date.now();
      const timeAdjustments = new Map<string, number>();
      
      // Calculate accumulated time for each persisted timer
      parsed.runningTimers.forEach(persistedTimer => {
        const timeSincePersist = now - persistedTimer.persistedAt;
        const totalAccumulatedTime = persistedTimer.lastKnownElapsed + timeSincePersist;
        timeAdjustments.set(persistedTimer.id, totalAccumulatedTime);
        
        console.log(`🔄 Restored timer "${persistedTimer.name}": 
          - Persisted elapsed: ${(persistedTimer.lastKnownElapsed / 1000).toFixed(1)}s
          - Time since persist: ${(timeSincePersist / 1000).toFixed(1)}s  
          - Total to restore: ${(totalAccumulatedTime / 1000).toFixed(1)}s`);
      });

      return {
        runningTimerIds: parsed.runningTimers.map(t => t.id),
        timeAdjustments
      };
    } catch (error) {
      console.error('❌ Failed to load persisted state:', error);
      localStorage.removeItem(STORAGE_KEY);
      return { runningTimerIds: [], timeAdjustments: new Map() };
    }
  }, []);

  // Sync running timers to database
  const syncToDatabase = useCallback(async (timers: Timer[]) => {
    if (!user) return;

    const runningTimers = timers.filter(timer => timer.isRunning);
    if (runningTimers.length === 0) return;

    try {
      // Update each timer individually to avoid upsert issues
      const updatePromises = runningTimers.map(async (timer) => {
        const currentTime = timer.sessionStartTime 
          ? timer.elapsedTime + (Date.now() - timer.sessionStartTime.getTime())
          : timer.elapsedTime;

        return supabase
          .from('timers')
          .update({ 
            elapsed_time: currentTime, 
            last_accessed_at: new Date().toISOString() 
          })
          .eq('id', timer.id);
      });

      const results = await Promise.all(updatePromises);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        console.error('❌ Database sync failed for some timers:', errors);
        return false;
      }

      lastSyncRef.current = Date.now();
      console.log(`📤 Synced ${runningTimers.length} running timers to database`);
      return true;
    } catch (error) {
      console.error('❌ Database sync exception:', error);
      return false;
    }
  }, [user]);

  // Start automatic persistence and sync intervals
  const startAutomaticPersistence = useCallback((timers: Timer[]) => {
    // Clear existing intervals
    if (persistenceIntervalRef.current) {
      clearInterval(persistenceIntervalRef.current);
    }
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    // Start localStorage persistence interval
    persistenceIntervalRef.current = setInterval(() => {
      persistTimerState(timers);
    }, PERSISTENCE_INTERVAL);

    // Start database sync interval
    syncIntervalRef.current = setInterval(() => {
      syncToDatabase(timers);
    }, SYNC_INTERVAL);

    console.log('⏰ Started automatic persistence (localStorage: 5s, DB: 30s)');
  }, [persistTimerState, syncToDatabase]);

  // Stop automatic persistence
  const stopAutomaticPersistence = useCallback(() => {
    if (persistenceIntervalRef.current) {
      clearInterval(persistenceIntervalRef.current);
      persistenceIntervalRef.current = null;
    }
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
    console.log('⏹️ Stopped automatic persistence');
  }, []);

  // Clear persisted state
  const clearPersistedState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ Cleared persisted timer state');
    } catch (error) {
      console.error('❌ Failed to clear persisted state:', error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (persistenceIntervalRef.current) {
        clearInterval(persistenceIntervalRef.current);
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  return {
    persistTimerState,
    loadPersistedState,
    syncToDatabase,
    startAutomaticPersistence,
    stopAutomaticPersistence,
    clearPersistedState,
    lastSync: lastSyncRef.current
  };
};