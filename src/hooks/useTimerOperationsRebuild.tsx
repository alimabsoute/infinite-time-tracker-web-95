
import { useCallback } from 'react';
import { Timer } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface UseTimerOperationsProps {
  timers: Timer[];
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
  calculateSessionElapsedTime: (timer: Timer) => number;
  reloadTimers: () => Promise<void>;
}

export const useTimerOperationsRebuild = ({ 
  timers, 
  setTimers, 
  calculateSessionElapsedTime,
  reloadTimers 
}: UseTimerOperationsProps) => {
  const { user } = useAuth();

  const toggleTimer = useCallback(async (timerId: string) => {
    if (!user) return;

    const timer = timers.find(t => t.id === timerId);
    if (!timer) return;

    try {
      const now = new Date();
      
      if (timer.isRunning) {
        // Stop the timer

        // Calculate final elapsed time
        const finalElapsedTime = calculateSessionElapsedTime(timer);
        
        // End the session if it exists
        if (timer.currentSessionId) {
          const sessionDuration = now.getTime() - (timer.sessionStartTime?.getTime() || now.getTime());
          
          await supabase
            .from('timer_sessions')
            .update({
              end_time: now.toISOString(),
              duration_ms: sessionDuration
            })
            .eq('id', timer.currentSessionId);
        }

        // Update timer in database
        await supabase
          .from('timers')
          .update({
            elapsed_time: Math.floor(finalElapsedTime),
            is_running: false
          })
          .eq('id', timerId);

        // Update local state
        setTimers(prev => prev.map(t => 
          t.id === timerId 
            ? { 
                ...t, 
                isRunning: false, 
                elapsedTime: finalElapsedTime,
                currentSessionId: undefined,
                sessionStartTime: undefined 
              }
            : t
        ));

        toast.success(`Timer "${timer.name}" stopped`);
      } else {
        // Start the timer - first stop all other running timers

        // Stop all currently running timers
        const runningTimers = timers.filter(t => t.isRunning);
        for (const runningTimer of runningTimers) {
          const runningElapsedTime = calculateSessionElapsedTime(runningTimer);
          
          if (runningTimer.currentSessionId) {
            const sessionDuration = now.getTime() - (runningTimer.sessionStartTime?.getTime() || now.getTime());
            
            await supabase
              .from('timer_sessions')
              .update({
                end_time: now.toISOString(),
                duration_ms: sessionDuration
              })
              .eq('id', runningTimer.currentSessionId);
          }

          await supabase
            .from('timers')
            .update({
              elapsed_time: Math.floor(runningElapsedTime),
              is_running: false
            })
            .eq('id', runningTimer.id);
        }

        // Create new session for the timer we're starting
        // First, clean up any existing orphaned sessions for this timer
        await supabase
          .from('timer_sessions')
          .update({ end_time: now.toISOString() })
          .eq('timer_id', timerId)
          .is('end_time', null);

        const sessionId = crypto.randomUUID();
        await supabase
          .from('timer_sessions')
          .insert({
            id: sessionId,
            timer_id: timerId,
            start_time: now.toISOString(),
            user_id: user.id
          });

        // Update timer to running state
        await supabase
          .from('timers')
          .update({ is_running: true })
          .eq('id', timerId);

        // Update local state - stop all timers, start the selected one
        setTimers(prev => prev.map(t => {
          if (t.id === timerId) {
            return {
              ...t,
              isRunning: true,
              currentSessionId: sessionId,
              sessionStartTime: now
            };
          } else if (t.isRunning) {
            return {
              ...t,
              isRunning: false,
              elapsedTime: calculateSessionElapsedTime(t),
              currentSessionId: undefined,
              sessionStartTime: undefined
            };
          }
          return t;
        }));

        toast.success(`Timer "${timer.name}" started`);
      }
    } catch (error) {
      console.error('❌ Error toggling timer:', error);
      toast.error('Failed to toggle timer');
      // Reload timers to ensure consistency
      reloadTimers();
    }
  }, [user, timers, setTimers, calculateSessionElapsedTime, reloadTimers]);

  const resetTimer = useCallback(async (timerId: string) => {
    if (!user) return;

    const timer = timers.find(t => t.id === timerId);
    if (!timer) return;

    try {
      // If timer is running, stop it first
      if (timer.isRunning && timer.currentSessionId) {
        await supabase
          .from('timer_sessions')
          .update({
            end_time: new Date().toISOString(),
            duration_ms: 0
          })
          .eq('id', timer.currentSessionId);
      }

      // Reset timer in database
      await supabase
        .from('timers')
        .update({
          elapsed_time: 0,
          is_running: false
        })
        .eq('id', timerId);

      // Update local state
      setTimers(prev => prev.map(t => 
        t.id === timerId 
          ? { 
              ...t, 
              elapsedTime: 0, 
              isRunning: false,
              currentSessionId: undefined,
              sessionStartTime: undefined 
            }
          : t
      ));

      toast.success(`Timer "${timer.name}" reset`);
    } catch (error) {
      console.error('❌ Error resetting timer:', error);
      toast.error('Failed to reset timer');
      reloadTimers();
    }
  }, [user, timers, setTimers, reloadTimers]);

  const deleteTimer = useCallback(async (timerId: string) => {
    if (!user) return;

    const timer = timers.find(t => t.id === timerId);
    if (!timer) return;

    try {
      // If timer is running, end its session
      if (timer.isRunning && timer.currentSessionId) {
        await supabase
          .from('timer_sessions')
          .update({
            end_time: new Date().toISOString(),
            duration_ms: 0
          })
          .eq('id', timer.currentSessionId);
      }

      // Soft delete timer
      await supabase
        .from('timers')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user.id
        })
        .eq('id', timerId);

      // Remove from local state
      setTimers(prev => prev.filter(t => t.id !== timerId));

      toast.success(`Timer "${timer.name}" deleted`);
    } catch (error) {
      console.error('❌ Error deleting timer:', error);
      toast.error('Failed to delete timer');
      reloadTimers();
    }
  }, [user, timers, setTimers, reloadTimers]);

  return {
    toggleTimer,
    resetTimer,
    deleteTimer
  };
};
