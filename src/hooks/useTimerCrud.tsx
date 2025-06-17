
import { useCallback } from 'react';
import { Timer } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface UseTimerCrudProps {
  timers: Timer[];
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
}

export const useTimerCrud = ({ timers, setTimers }: UseTimerCrudProps) => {
  const { user } = useAuth();

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
        console.error("❌ Error renaming timer:", error);
      }
    } catch (error) {
      console.error("❌ Error renaming timer:", error);
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
        console.error("❌ Error updating deadline:", error);
      } else if (deadline) {
        toast.success("Deadline updated", { 
          description: `Deadline set for ${deadline.toLocaleDateString()} at ${deadline.toLocaleTimeString()}` 
        });
      }
    } catch (error) {
      console.error("❌ Error updating deadline:", error);
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
        console.error("❌ Error updating priority:", error);
      } else if (priority !== undefined) {
        toast.success(`Priority set to ${priority}`, {
          description: priority === 1 ? "Highest priority" : priority === 5 ? "Lowest priority" : "",
        });
      }
    } catch (error) {
      console.error("❌ Error updating priority:", error);
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
      console.error("❌ Error reordering timers:", error);
      toast.error("Failed to reorder timers");
    }
  }, [timers, user, setTimers]);

  return {
    renameTimer,
    updateDeadline,
    updatePriority,
    reorderTimers
  };
};
