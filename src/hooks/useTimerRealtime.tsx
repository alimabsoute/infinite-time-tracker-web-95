
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
            return { ...newTimer, elapsedTime: runningTimer.elapsedTime };
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
            const preservedElapsedTime = timer.isRunning ? timer.elapsedTime : data.elapsed_time;
            
            return {
              ...timer,
              name: data.name,
              isRunning: data.is_running,
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
