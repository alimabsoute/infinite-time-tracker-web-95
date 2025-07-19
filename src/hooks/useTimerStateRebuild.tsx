
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
        isRunning: false, // Start with false, will be set based on persistence + session validation
        createdAt: new Date(timer.created_at),
        deadline: timer.deadline ? new Date(timer.deadline) : undefined,
        category: timer.category || undefined,
        tags: timer.tags || undefined,
        priority: timer.priority || undefined,
        currentSessionId: undefined,
        sessionStartTime: undefined,
      }));

      // For persisted running timers, validate and restore sessions
      if (runningIds.length > 0) {
        console.log('🔍 Validating running timers:', runningIds);
        
        const { data: sessions, error: sessionError } = await supabase
          .from('timer_sessions')
          .select('*')
          .in('timer_id', runningIds)
          .is('end_time', null);

        if (!sessionError && sessions) {
          console.log('📋 Found active sessions:', sessions.length);
          
          // Restore running state only for timers with valid active sessions
          processedTimers.forEach(timer => {
            if (runningIds.includes(timer.id)) {
              const activeSession = sessions.find(s => s.timer_id === timer.id);
              if (activeSession) {
                console.log(`✅ Restoring timer: ${timer.name} with session from ${activeSession.start_time}`);
                timer.isRunning = true;
                timer.currentSessionId = activeSession.id;
                timer.sessionStartTime = new Date(activeSession.start_time);
                
                // Start new session if the session is too old (over 1 hour suggests tab was closed long ago)
                const sessionAge = Date.now() - new Date(activeSession.start_time).getTime();
                if (sessionAge > 60 * 60 * 1000) { // 1 hour
                  console.log(`⚠️ Session too old for ${timer.name}, will create new session`);
                  // This will be handled by creating a fresh session below
                }
              } else {
                console.log(`⚠️ No active session found for running timer: ${timer.name}, creating new session`);
                // Create new session for this timer since it was marked as running but has no session
                timer.isRunning = true;
                timer.sessionStartTime = new Date(); // Start from now
              }
            }
          });

          // Create missing sessions for timers that should be running but don't have sessions
          const timersNeedingSessions = processedTimers.filter(t => 
            t.isRunning && !t.currentSessionId
          );

          for (const timer of timersNeedingSessions) {
            try {
              const sessionId = crypto.randomUUID();
              const now = new Date();
              
              await supabase
                .from('timer_sessions')
                .insert({
                  id: sessionId,
                  timer_id: timer.id,
                  start_time: now.toISOString(),
                  user_id: user.id
                });

              timer.currentSessionId = sessionId;
              timer.sessionStartTime = now;
              console.log(`🆕 Created new session for ${timer.name}`);
            } catch (error) {
              console.error(`❌ Failed to create session for ${timer.name}:`, error);
              // If we can't create a session, mark timer as not running
              timer.isRunning = false;
            }
          }
        } else {
          console.warn('❌ Failed to load sessions, clearing running state');
          // If we can't load sessions, clear all running states
          runningIds.length = 0;
        }
      }

      const finalRunningCount = processedTimers.filter(t => t.isRunning).length;
      console.log(`✅ Loaded ${processedTimers.length} timers (${finalRunningCount} running)`);
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

  // Page visibility handling - REMOVED as it's causing issues
  // The visibility change handler was causing timers to reload incorrectly
  // which was stopping running timers
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (document.hidden) {
  //       console.log('👋 Page hidden - saving state');
  //       const runningIds = timersRef.current.filter(t => t.isRunning).map(t => t.id);
  //       saveSimpleState(runningIds);
  //     } else {
  //       console.log('👁️ Page visible - reloading timers');
  //       loadTimers();
  //     }
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);
  //   return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  // }, [loadTimers, saveSimpleState]);

  // Before unload handling - REMOVED to prevent interference
  // This could cause state persistence issues during timer operations
  // useEffect(() => {
  //   const handleBeforeUnload = () => {
  //     console.log('💾 Before unload - saving state');
  //     const runningIds = timersRef.current.filter(t => t.isRunning).map(t => t.id);
  //     saveSimpleState(runningIds);
  //   };

  //   window.addEventListener('beforeunload', handleBeforeUnload);
  //   return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  // }, [saveSimpleState]);

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
