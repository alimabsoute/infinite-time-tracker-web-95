
import { useState, useEffect, useRef, useCallback } from 'react';
import { Timer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Simple persistence - only track what's essential
interface SimpleTimerPersistence {
  runningTimerIds: string[];
  lastSaveTime: number;
}

export const useTimerStateRebuild = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout>();
  const timersRef = useRef<Timer[]>([]);

  // Update ref when timers change
  useEffect(() => {
    timersRef.current = timers;
  }, [timers]);

  // Simple persistence functions
  const saveSimpleState = useCallback((runningIds: string[]) => {
    try {
      const persistenceData: SimpleTimerPersistence = {
        runningTimerIds: runningIds,
        lastSaveTime: Date.now()
      };
      localStorage.setItem('timer-simple-state', JSON.stringify(persistenceData));
      console.log('💾 Saved simple state:', runningIds);
    } catch (error) {
      console.warn('Failed to save simple state:', error);
    }
  }, []);

  const loadSimpleState = useCallback((): string[] => {
    try {
      const saved = localStorage.getItem('timer-simple-state');
      if (saved) {
        const data: SimpleTimerPersistence = JSON.parse(saved);
        console.log('📂 Loaded simple state:', data.runningTimerIds);
        return data.runningTimerIds;
      }
    } catch (error) {
      console.warn('Failed to load simple state:', error);
    }
    return [];
  }, []);

  const clearSimpleState = useCallback(() => {
    try {
      localStorage.removeItem('timer-simple-state');
      console.log('🧹 Cleared simple state');
    } catch (error) {
      console.warn('Failed to clear simple state:', error);
    }
  }, []);

  // Session-based elapsed time calculation
  const calculateSessionElapsedTime = useCallback((timer: Timer): number => {
    if (!timer.isRunning || !timer.sessionStartTime) {
      return timer.elapsedTime;
    }
    
    const sessionDuration = Date.now() - timer.sessionStartTime.getTime();
    return timer.elapsedTime + sessionDuration;
  }, []);

  // Load timers from database
  const loadTimers = useCallback(async () => {
    if (!user) {
      setTimers([]);
      setLoading(false);
      clearSimpleState();
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Loading timers from database...');

      const { data, error } = await supabase
        .from('timers')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading timers:', error);
        toast.error('Failed to load timers');
        return;
      }

      // Load simple persistence state
      const runningIds = loadSimpleState();
      console.log('🏃 Persisted running timer IDs:', runningIds);

      // Process timers with session-based approach
      const processedTimers: Timer[] = data.map(timer => ({
        id: timer.id,
        name: timer.name,
        elapsedTime: timer.elapsed_time, // Database is source of truth for saved time
        isRunning: runningIds.includes(timer.id), // Only use persistence for running state
        createdAt: new Date(timer.created_at),
        deadline: timer.deadline ? new Date(timer.deadline) : undefined,
        category: timer.category || undefined,
        tags: timer.tags || undefined,
        priority: timer.priority || undefined,
        currentSessionId: undefined,
        sessionStartTime: undefined,
      }));

      // For running timers, load their active sessions
      const runningTimerIds = processedTimers.filter(t => t.isRunning).map(t => t.id);
      if (runningTimerIds.length > 0) {
        const { data: sessions, error: sessionError } = await supabase
          .from('timer_sessions')
          .select('*')
          .in('timer_id', runningTimerIds)
          .is('end_time', null);

        if (!sessionError && sessions) {
          processedTimers.forEach(timer => {
            if (timer.isRunning) {
              const activeSession = sessions.find(s => s.timer_id === timer.id);
              if (activeSession) {
                timer.currentSessionId = activeSession.id;
                timer.sessionStartTime = new Date(activeSession.start_time);
              }
            }
          });
        }
      }

      console.log(`✅ Loaded ${processedTimers.length} timers (${runningTimerIds.length} running)`);
      setTimers(processedTimers);
    } catch (error) {
      console.error('❌ Error loading timers:', error);
      toast.error('Failed to load timers');
    } finally {
      setLoading(false);
    }
  }, [user, loadSimpleState, clearSimpleState]);

  // Auto-save running timer IDs
  useEffect(() => {
    const runningIds = timers.filter(t => t.isRunning).map(t => t.id);
    saveSimpleState(runningIds);
  }, [timers, saveSimpleState]);

  // Timer interval for UI updates
  useEffect(() => {
    const runningTimers = timers.filter(t => t.isRunning);
    
    if (runningTimers.length > 0) {
      console.log(`⏱️ Starting interval for ${runningTimers.length} running timers`);
      
      intervalRef.current = setInterval(() => {
        setTimers(prevTimers => 
          prevTimers.map(timer => {
            if (timer.isRunning && timer.sessionStartTime) {
              return {
                ...timer,
                elapsedTime: calculateSessionElapsedTime(timer)
              };
            }
            return timer;
          })
        );
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timers, calculateSessionElapsedTime]);

  // Page visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('👋 Page hidden - saving state');
        const runningIds = timersRef.current.filter(t => t.isRunning).map(t => t.id);
        saveSimpleState(runningIds);
      } else {
        console.log('👁️ Page visible - reloading timers');
        loadTimers();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadTimers, saveSimpleState]);

  // Before unload handling
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('💾 Before unload - saving state');
      const runningIds = timersRef.current.filter(t => t.isRunning).map(t => t.id);
      saveSimpleState(runningIds);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveSimpleState]);

  // Initial load
  useEffect(() => {
    loadTimers();
  }, [loadTimers]);

  return {
    timers,
    setTimers,
    loading,
    timersRef,
    calculateSessionElapsedTime,
    reloadTimers: loadTimers
  };
};
