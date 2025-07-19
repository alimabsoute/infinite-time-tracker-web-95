
import { useEffect, useCallback } from 'react';
import { Timer } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

interface UseTimerRealtimeProps {
  timers: Timer[];
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
}

export const useTimerRealtime = ({ timers, setTimers }: UseTimerRealtimeProps) => {
  const { user } = useAuth();

  const handleTimerUpdate = useCallback(async (payload: any) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
      const { data, error } = await supabase
        .from('timers')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching updated timers:", error);
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
      }));
      
      setTimers(prevTimers => {
        const runningTimers = prevTimers.filter(t => t.isRunning);
        
        return processedTimers.map(newTimer => {
          const runningTimer = runningTimers.find(rt => rt.id === newTimer.id);
          if (runningTimer && newTimer.isRunning) {
            // PROTECTION: For running timers, preserve local elapsed time
            return { 
              ...newTimer, 
              elapsedTime: Math.max(runningTimer.elapsedTime, newTimer.elapsedTime),
              isRunning: runningTimer.isRunning // Keep local running state
            };
          }
          return newTimer;
        });
      });
    } else if (payload.eventType === 'UPDATE') {
      const { data, error } = await supabase
        .from('timers')
        .select('*')
        .eq('id', payload.new.id)
        .single();

      if (error || !data || data.deleted_at) {
        if (data?.deleted_at) {
          setTimers(prevTimers => prevTimers.filter(timer => timer.id !== data.id));
        }
        return;
      }

      setTimers(prevTimers => {
        return prevTimers.map(timer => {
          if (timer.id === data.id) {
            // CRITICAL PROTECTION: For running timers, never overwrite elapsed time from database
            const shouldPreserveElapsedTime = timer.isRunning && data.is_running;
            const preservedElapsedTime = shouldPreserveElapsedTime 
              ? Math.max(timer.elapsedTime, data.elapsed_time) // Never reduce elapsed time
              : data.elapsed_time;
            
            // Also preserve running state if locally running
            const preservedRunningState = timer.isRunning || data.is_running;
            
            console.log(`🔄 Realtime update for ${timer.name}:`, {
              wasRunning: timer.isRunning,
              dbRunning: data.is_running,
              preserveElapsed: shouldPreserveElapsedTime,
              currentElapsed: timer.elapsedTime,
              dbElapsed: data.elapsed_time,
              finalElapsed: preservedElapsedTime,
              finalRunning: preservedRunningState
            });
            
            return {
              ...timer,
              name: data.name,
              isRunning: preservedRunningState,
              category: data.category || undefined,
              deadline: data.deadline ? new Date(data.deadline) : undefined,
              priority: data.priority || undefined,
              elapsedTime: preservedElapsedTime
            };
          }
          return timer;
        });
      });
    }
  }, [setTimers]);

  // Subscribe to real-time updates from Supabase
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('timers_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'timers' 
        }, 
        handleTimerUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, handleTimerUpdate]);
};
