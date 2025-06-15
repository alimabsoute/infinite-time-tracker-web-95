
import { useCallback } from 'react';
import { Timer } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNotifications } from './useNotifications';
import { useTimerSessions } from './useTimerSessions';
import { toast } from 'sonner';

interface UseTimerActionsProps {
  timers: Timer[];
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
  setConfettiTrigger: React.Dispatch<React.SetStateAction<{ x: number; y: number; id: string } | null>>;
  clearConfettiTrigger: () => void;
}

export const useTimerActions = ({ 
  timers, 
  setTimers, 
  setConfettiTrigger, 
  clearConfettiTrigger 
}: UseTimerActionsProps) => {
  const { user } = useAuth();
  const { canCreateTimer, getTimerLimit } = useSubscription();
  const { notifyTimerCompletion } = useNotifications();
  const { createSession, endSession, endMultipleSessions } = useTimerSessions();

  const addTimer = useCallback(async (name: string, category?: string): Promise<string> => {
    if (!user) {
      toast.error("You must be logged in to create timers");
      return "";
    }

    if (!canCreateTimer(timers.length)) {
      const limit = getTimerLimit();
      toast.error("Timer limit reached", {
        description: `Free plan allows up to ${limit} timers. Upgrade to create unlimited timers.`
      });
      return "";
    }

    try {
      const newTimer: Timer = {
        id: crypto.randomUUID(),
        name,
        elapsedTime: 0,
        isRunning: true,
        createdAt: new Date(),
        category,
        sessionStartTime: new Date(),
      };
      
      console.log('➕ Adding new timer:', newTimer.name);
      
      const runningTimers = timers.filter(t => t.isRunning);
      
      // Optimistic Update
      const newSessionId = crypto.randomUUID();
      newTimer.currentSessionId = newSessionId;

      setTimers((prev) => [
        newTimer,
        ...prev.map(timer => timer.isRunning ? { ...timer, isRunning: false, currentSessionId: undefined, sessionStartTime: undefined } : timer)
      ]);
      
      // Database Operations
      const now = new Date();
      const updates = [];
      
      // End sessions for all currently running timers
      await endMultipleSessions(runningTimers, now);
      
      // Insert the new timer
      updates.push(
        supabase
          .from('timers')
          .insert({
            id: newTimer.id,
            name: newTimer.name,
            elapsed_time: newTimer.elapsedTime,
            is_running: newTimer.isRunning,
            created_at: newTimer.createdAt.toISOString(),
            category: newTimer.category,
            user_id: user.id
          })
      );

      // Insert the new session
      const sessionResult = await createSession(newTimer.id, newTimer.sessionStartTime!, newSessionId);
      
      const results = await Promise.all(updates);
      
      const hasErrors = results.some(result => result.error) || !sessionResult;
      
      if (hasErrors) {
        setTimers((prev) => prev.filter(t => t.id !== newTimer.id));
        toast.error("Failed to create timer");
        console.error("Error adding timer and pausing others");
        return "";
      }
      
      clearConfettiTrigger();
      
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      console.log('🎉 Triggering confetti at:', { x: centerX, y: centerY });
      setConfettiTrigger({ x: centerX, y: centerY, id: newTimer.id });
      
      if (runningTimers.length > 0) {
        toast.success("Timer created and started", {
          description: `${runningTimers.length} other timer${runningTimers.length > 1 ? 's' : ''} paused automatically`
        });
      } else {
        toast.success("Timer created and started");
      }
      
      return newTimer.id;
    } catch (error) {
      console.error("Error adding timer:", error);
      toast.error("Failed to create timer");
      return "";
    }
  }, [user, timers, clearConfettiTrigger, canCreateTimer, getTimerLimit, setTimers, setConfettiTrigger, createSession, endMultipleSessions]);

  const toggleTimer = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const targetTimer = timers.find(t => t.id === id);
      if (!targetTimer) return;

      const newRunningState = !targetTimer.isRunning;

      if (newRunningState) {
        const now = new Date();
        const newSessionId = crypto.randomUUID();

        setTimers((prev) =>
          prev.map((timer) =>
            timer.id === id
              ? { ...timer, isRunning: true, currentSessionId: newSessionId, sessionStartTime: now }
              : timer
          )
        );
        
        await createSession(id, now, newSessionId);
        await supabase.from('timers').update({ is_running: true }).eq('id', id);
        
        toast.success("Timer started");

      } else {
        if (!targetTimer.currentSessionId || !targetTimer.sessionStartTime) {
          console.warn("Attempted to stop a timer with no active session.");
          setTimers(prev => prev.map(t => t.id === id ? { ...t, isRunning: false } : t));
          await supabase.from('timers').update({ is_running: false }).eq('id', id);
          toast.success("Timer paused");
          return;
        }

        const now = new Date();
        const duration = now.getTime() - targetTimer.sessionStartTime.getTime();
        const newElapsedTime = targetTimer.elapsedTime + duration;

        notifyTimerCompletion(targetTimer.name, newElapsedTime);

        setTimers((prev) =>
          prev.map((timer) =>
            timer.id === id
              ? { ...timer, isRunning: false, elapsedTime: newElapsedTime, currentSessionId: undefined, sessionStartTime: undefined }
              : timer
          )
        );

        await endSession(targetTimer.currentSessionId, now, duration);
        await supabase.from('timers').update({
          is_running: false,
          elapsed_time: newElapsedTime
        }).eq('id', id);
        
        toast.success("Timer paused");
      }

    } catch (error) {
      console.error("Error toggling timer:", error);
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

      setTimers((prev) =>
        prev.map((timer) =>
          timer.id === id
            ? { ...timer, elapsedTime: 0, isRunning: false, currentSessionId: undefined, sessionStartTime: undefined }
            : timer
        )
      );

      if (timerToReset?.isRunning && timerToReset.currentSessionId && timerToReset.sessionStartTime) {
        const now = new Date();
        const duration = now.getTime() - timerToReset.sessionStartTime.getTime();
        await endSession(timerToReset.currentSessionId, now, duration);
      }

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
        console.error("Error resetting timer:", error);
      }
    } catch (error) {
      console.error("Error resetting timer:", error);
      toast.error("Failed to reset timer");
    }
  }, [timers, user, notifyTimerCompletion, setTimers, endSession]);

  const deleteTimer = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const timerToDelete = timers.find(t => t.id === id);
      if (!timerToDelete) return;

      if (timerToDelete.isRunning && timerToDelete.currentSessionId && timerToDelete.sessionStartTime) {
        const now = new Date();
        const duration = now.getTime() - timerToDelete.sessionStartTime.getTime();
        await endSession(timerToDelete.currentSessionId, now, duration);
        await supabase.from('timers').update({
          elapsed_time: timerToDelete.elapsedTime + duration
        }).eq('id', id);
      }

      setTimers((prev) => prev.filter(timer => timer.id !== id));

      const { error } = await supabase
        .from('timers')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user.id
        })
        .eq('id', id);
      
      if (error) {
        setTimers((prev) => [...prev]);
        toast.error("Failed to delete timer");
        console.error("Error deleting timer:", error);
      } else {
        toast.success("Timer deleted");
      }
    } catch (error) {
      console.error("Error deleting timer:", error);
      toast.error("Failed to delete timer");
    }
  }, [timers, user, setTimers, endSession]);

  const renameTimer = useCallback(async (id: string, newName: string, category?: string) => {
    if (!user) return;

    try {
      const timerToUpdate = timers.find(t => t.id === id);
      if (!timerToUpdate) return;
      
      const isCurrentlyRunning = timerToUpdate.isRunning;

      setTimers((prev) =>
        prev.map((timer) =>
          timer.id === id
            ? { 
                ...timer, 
                name: newName, 
                isRunning: isCurrentlyRunning,
                category: category !== undefined ? category : timer.category
              }
            : timer
        )
      );

      const { error } = await supabase
        .from('timers')
        .update({
          name: newName,
          is_running: isCurrentlyRunning,
          category: category !== undefined ? category : timerToUpdate.category
        })
        .eq('id', id);
      
      if (error) {
        setTimers((prev) => [...prev]);
        toast.error("Failed to rename timer");
        console.error("Error renaming timer:", error);
      }
    } catch (error) {
      console.error("Error renaming timer:", error);
      toast.error("Failed to rename timer");
    }
  }, [timers, user, setTimers]);

  const updateDeadline = useCallback(async (id: string, deadline: Date | undefined) => {
    if (!user) return;

    try {
      setTimers((prev) =>
        prev.map((timer) =>
          timer.id === id
            ? { ...timer, deadline }
            : timer
        )
      );

      const { error } = await supabase
        .from('timers')
        .update({
          deadline: deadline?.toISOString()
        })
        .eq('id', id);
      
      if (error) {
        setTimers((prev) => [...prev]);
        toast.error("Failed to update deadline");
        console.error("Error updating deadline:", error);
      } else if (deadline) {
        toast.success("Deadline updated", { 
          description: `Deadline set for ${deadline.toLocaleDateString()} at ${deadline.toLocaleTimeString()}` 
        });
      }
    } catch (error) {
      console.error("Error updating deadline:", error);
      toast.error("Failed to update deadline");
    }
  }, [user, setTimers]);

  const updatePriority = useCallback(async (id: string, priority: number | undefined) => {
    if (!user) return;

    try {
      setTimers((prev) =>
        prev.map((timer) =>
          timer.id === id
            ? { ...timer, priority }
            : timer
        )
      );

      const { error } = await supabase
        .from('timers')
        .update({
          priority
        })
        .eq('id', id);
      
      if (error) {
        setTimers((prev) => [...prev]);
        toast.error("Failed to update priority");
        console.error("Error updating priority:", error);
      } else if (priority !== undefined) {
        toast.success(`Priority set to ${priority}`, {
          description: priority === 1 ? "Highest priority" : priority === 5 ? "Lowest priority" : "",
        });
      }
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error("Failed to update priority");
    }
  }, [user, setTimers]);

  const reorderTimers = useCallback(async (reorderedTimers: Timer[]) => {
    if (!user) return;
    
    try {
      const otherTimers = timers.filter(
        timer => !reorderedTimers.some(rt => rt.id === timer.id)
      );
      
      setTimers([...reorderedTimers, ...otherTimers]);
    } catch (error) {
      console.error("Error reordering timers:", error);
      toast.error("Failed to reorder timers");
    }
  }, [timers, user, setTimers]);

  return {
    addTimer,
    toggleTimer,
    resetTimer,
    deleteTimer,
    renameTimer,
    updateDeadline,
    updatePriority,
    reorderTimers
  };
};
