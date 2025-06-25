
import { useCallback } from 'react';
import { Timer } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from './useNotifications';
import { useSessionManager } from './useSessionManager';
import { toast } from 'sonner';

interface UseTimerOperationsProps {
  timers: Timer[];
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
}

export const useTimerOperations = ({ timers, setTimers }: UseTimerOperationsProps) => {
  const { user } = useAuth();
  const { notifyTimerCompletion } = useNotifications();
  const { createSession, endSession } = useSessionManager();

  const toggleTimer = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const targetTimer = timers.find(t => t.id === id);
      if (!targetTimer) return;

      const newRunningState = !targetTimer.isRunning;
      const now = new Date();

      if (newRunningState) {
        // Starting timer
        const sessionId = await createSession(id, now);
        if (!sessionId) {
          toast.error("Failed to start timer session");
          return;
        }

        setTimers((prev) =>
          prev.map((timer) =>
            timer.id === id
              ? { ...timer, isRunning: true, currentSessionId: sessionId, sessionStartTime: now }
              : timer
          )
        );
        
        await supabase.from('timers').update({ is_running: true }).eq('id', id);
        toast.success("Timer started");

      } else {
        // Stopping timer
        if (!targetTimer.currentSessionId || !targetTimer.sessionStartTime) {
          console.warn("⚠️ Stopping timer with no active session");
          setTimers(prev => prev.map(t => t.id === id ? { ...t, isRunning: false } : t));
          await supabase.from('timers').update({ is_running: false }).eq('id', id);
          toast.success("Timer paused");
          return;
        }

        const duration = now.getTime() - targetTimer.sessionStartTime.getTime();
        const newElapsedTime = targetTimer.elapsedTime + duration;

        // End session
        const sessionEnded = await endSession(id, targetTimer.currentSessionId, now, duration);
        if (!sessionEnded) {
          toast.error("Failed to end timer session");
          return;
        }

        notifyTimerCompletion(targetTimer.name, newElapsedTime);

        setTimers((prev) =>
          prev.map((timer) =>
            timer.id === id
              ? { ...timer, isRunning: false, elapsedTime: newElapsedTime, currentSessionId: undefined, sessionStartTime: undefined }
              : timer
          )
        );

        await supabase.from('timers').update({
          is_running: false,
          elapsed_time: newElapsedTime
        }).eq('id', id);
        
        toast.success("Timer paused");
      }

    } catch (error) {
      console.error("❌ Error toggling timer:", error);
      toast.error("Failed to update timer");
    }
  }, [timers, user, notifyTimerCompletion, setTimers, createSession, endSession]);

  const resetTimer = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const timerToReset = timers.find(t => t.id === id);

      if (timerToReset?.isRunning && timerToReset.elapsedTime > 0) {
        notifyTimerCompletion(timerToReset.name, timerToReset.elapsedTime);
      }

      // End active session if running
      if (timerToReset?.isRunning && timerToReset.currentSessionId && timerToReset.sessionStartTime) {
        const now = new Date();
        const duration = now.getTime() - timerToReset.sessionStartTime.getTime();
        await endSession(timerToReset.id, timerToReset.currentSessionId, now, duration);
      }

      setTimers((prev) =>
        prev.map((timer) =>
          timer.id === id
            ? { ...timer, elapsedTime: 0, isRunning: false, currentSessionId: undefined, sessionStartTime: undefined }
            : timer
        )
      );

      const { error } = await supabase
        .from('timers')
        .update({
          elapsed_time: 0,
          is_running: false
        })
        .eq('id', id);
      
      if (error) {
        setTimers((prev) => [...prev]);
        toast.error("Failed to reset timer");
        console.error("❌ Error resetting timer:", error);
      }
    } catch (error) {
      console.error("❌ Error resetting timer:", error);
      toast.error("Failed to reset timer");
    }
  }, [timers, user, notifyTimerCompletion, setTimers, endSession]);

  const deleteTimer = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const timerToDelete = timers.find(t => t.id === id);
      if (!timerToDelete) return;

      // End active session if running
      if (timerToDelete.isRunning && timerToDelete.currentSessionId && timerToDelete.sessionStartTime) {
        const now = new Date();
        const duration = now.getTime() - timerToDelete.sessionStartTime.getTime();
        await endSession(timerToDelete.id, timerToDelete.currentSessionId, now, duration);
        await supabase.from('timers').update({
          elapsed_time: timerToDelete.elapsedTime + duration
        }).eq('id', id);
      }

      // Remove from local state immediately (the animation component will handle the visual removal)
      setTimers((prev) => prev.filter(timer => timer.id !== id));

      // Mark as deleted in database
      const { error } = await supabase
        .from('timers')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user.id
        })
        .eq('id', id);
      
      if (error) {
        // Restore timer if database update failed
        setTimers((prev) => [...prev]);
        toast.error("Failed to delete timer");
        console.error("❌ Error deleting timer:", error);
      } else {
        toast.success("Timer deleted");
      }
    } catch (error) {
      console.error("❌ Error deleting timer:", error);
      toast.error("Failed to delete timer");
    }
  }, [timers, user, setTimers, endSession]);

  return {
    toggleTimer,
    resetTimer,
    deleteTimer
  };
};
