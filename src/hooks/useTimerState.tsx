
import { useState, useEffect, useRef } from 'react';
import { Timer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useRunningTimerPersistence } from './useRunningTimerPersistence';
import { useTimerSync } from './useTimerSync';
import { toast } from 'sonner';

export const useTimerState = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { saveRunningTimers, loadRunningTimers, clearRunningTimers } = useRunningTimerPersistence();
  const { batchSyncTimers } = useTimerSync();

  // Refs for tracking state
  const timersRef = useRef<Timer[]>([]);
  const hasLoadedRef = useRef(false);

  // Update timers ref when timers change
  useEffect(() => {
    timersRef.current = timers;
  }, [timers]);

  // Load timers from Supabase on initial render and when user changes
  useEffect(() => {
    if (!user) {
      setTimers([]);
      setLoading(false);
      clearRunningTimers();
      hasLoadedRef.current = false;
      return;
    }

    // Prevent multiple loads
    if (hasLoadedRef.current) {
      console.log('⏭️ Skipping timer load - already loaded for this session');
      return;
    }

    const loadTimers = async () => {
      try {
        setLoading(true);
        console.log('🔄 Loading timers from database...');
        
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

        // CRITICAL: Load persisted running timer IDs BEFORE processing database data
        const persistedRunningIds = loadRunningTimers();
        console.log('🔒 IGNORING database running states, using local persistence only');
        console.log(`📋 Persisted running timer IDs:`, persistedRunningIds);
        
        const processedTimers = data.map(timer => {
          // COMPLETELY IGNORE database is_running field
          const shouldBeRunning = persistedRunningIds.includes(timer.id);
          
          return {
            id: timer.id,
            name: timer.name,
            elapsedTime: timer.elapsed_time,
            isRunning: shouldBeRunning, // ONLY use local persistence
            createdAt: new Date(timer.created_at),
            deadline: timer.deadline ? new Date(timer.deadline) : undefined,
            category: timer.category || undefined,
            tags: timer.tags || undefined,
            priority: timer.priority || undefined,
            currentSessionId: undefined,
            sessionStartTime: undefined,
          };
        });
        
        // Find any open sessions for the loaded timers
        const runningTimerIds = processedTimers.filter(t => t.isRunning).map(t => t.id);
        if (runningTimerIds.length > 0) {
          console.log(`🔍 Loading sessions for ${runningTimerIds.length} running timers`);
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
        
        console.log(`✅ Loaded ${processedTimers.length} timers with ${runningTimerIds.length} running`);
        setTimers(processedTimers);
        hasLoadedRef.current = true;
        
      } catch (error) {
        console.error("Error loading timers:", error);
        toast.error("Failed to load timers");
      } finally {
        setLoading(false);
      }
    };

    loadTimers();
  }, [user, loadRunningTimers, clearRunningTimers, batchSyncTimers]);

  // Auto-save running timers whenever timers change
  useEffect(() => {
    if (!hasLoadedRef.current) return; // Don't save until we've loaded
    
    const runningTimers = timers
      .filter(t => t.isRunning)
      .map(t => ({ id: t.id, name: t.name }));
    
    saveRunningTimers(runningTimers);
  }, [timers, saveRunningTimers]);

  return {
    timers,
    setTimers,
    loading,
    timersRef
  };
};
