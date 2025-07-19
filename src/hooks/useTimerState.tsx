
import { useState, useEffect, useRef } from 'react';
import { Timer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useTimerPersistence } from './useTimerPersistence';
import { useTimerSync } from './useTimerSync';
import { toast } from 'sonner';

export const useTimerState = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { loadTimerState, restoreTimerElapsedTime, clearTimerState } = useTimerPersistence();
  const { batchSyncTimers } = useTimerSync();

  // Refs for tracking state
  const timersRef = useRef<Timer[]>([]);

  // Update timers ref when timers change
  useEffect(() => {
    timersRef.current = timers;
  }, [timers]);

  // Load timers from Supabase on initial render and when user changes
  useEffect(() => {
    if (!user) {
      setTimers([]);
      setLoading(false);
      clearTimerState();
      return;
    }

    const loadTimers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('timers')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error loading timers:", error);
          toast.error("Failed to load timers");
          setTimers([]);
          return;
        }

        const processedTimers = data.map(timer => ({
          id: timer.id,
          name: timer.name,
          elapsedTime: timer.elapsed_time,
          isRunning: timer.is_running,
          createdAt: new Date(timer.created_at),
          deadline: timer.deadline ? new Date(timer.deadline) : undefined,
          category: timer.category || undefined,
          tags: timer.tags || undefined,
          priority: timer.priority || undefined,
          currentSessionId: undefined,
          sessionStartTime: undefined,
        }));
        
        // Find any open sessions for the loaded timers
        const runningTimerIds = processedTimers.filter(t => t.isRunning).map(t => t.id);
        if (runningTimerIds.length > 0) {
          const { data: openSessions, error: sessionError } = await (supabase
            .from('timer_sessions') as any)
            .select('*')
            .in('timer_id', runningTimerIds)
            .is('end_time', null);

          if (sessionError) {
            console.error("Error fetching open sessions:", sessionError);
          } else if (openSessions) {
            processedTimers.forEach(timer => {
              const openSession = openSessions.find((s: any) => s.timer_id === timer.id);
              if (openSession) {
                timer.currentSessionId = openSession.id;
                timer.sessionStartTime = new Date(openSession.start_time);
              }
            });
          }
        }
        
        // PRESERVE LOCAL RUNNING STATES: Don't restore from persistence on initial load 
        // This was causing timers to be paused when switching tabs
        console.log('🔒 Preserving local timer running states - not restoring from persistence');
        setTimers(processedTimers);
        
        // Clear old persistence data since we're loading fresh from database
        const persistenceData = loadTimerState();
        if (persistenceData) {
          console.log('🧹 Clearing old persistence data to prevent state conflicts');
          clearTimerState();
        }
      } catch (error) {
        console.error("Error loading timers:", error);
        toast.error("Failed to load timers");
      } finally {
        setLoading(false);
      }
    };

    loadTimers();
  }, [user, loadTimerState, restoreTimerElapsedTime, clearTimerState, batchSyncTimers]);

  return {
    timers,
    setTimers,
    loading,
    timersRef
  };
};
