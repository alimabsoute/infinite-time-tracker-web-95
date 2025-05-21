
import { useState, useEffect, useCallback } from "react";
import { Timer } from "../types";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export const useTimers = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load timers from Supabase on initial render and when user changes
  useEffect(() => {
    // Don't fetch if there's no user
    if (!user) {
      setTimers([]);
      setLoading(false);
      return;
    }

    const loadTimers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('timers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error loading timers:", error);
          toast.error("Failed to load timers");
          setTimers([]);
          return;
        }

        // Process dates to ensure they're Date objects
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
        
        setTimers(processedTimers);
      } catch (error) {
        console.error("Error loading timers:", error);
        toast.error("Failed to load timers");
      } finally {
        setLoading(false);
      }
    };

    loadTimers();
  }, [user]);

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
        async () => {
          // When anything changes, fetch the latest timers
          const { data, error } = await supabase
            .from('timers')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error("Error fetching updated timers:", error);
            return;
          }

          // Process dates to ensure they're Date objects
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
          
          setTimers(processedTimers);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Update running timers every second
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      setTimers((currentTimers) => {
        const updatedTimers = currentTimers.map((timer) => {
          if (timer.isRunning) {
            return {
              ...timer,
              elapsedTime: timer.elapsedTime + 1000, // add one second
            };
          }
          return timer;
        });

        // If any timers were updated, sync with Supabase
        const runningTimers = updatedTimers.filter(t => t.isRunning);
        if (runningTimers.length > 0) {
          runningTimers.forEach(timer => {
            supabase
              .from('timers')
              .update({
                elapsed_time: timer.elapsedTime,
                is_running: timer.isRunning
              })
              .eq('id', timer.id)
              .then(({ error }) => {
                if (error) console.error("Error updating timer:", error);
              });
          });
        }

        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const addTimer = useCallback(async (name: string, category?: string): Promise<string> => {
    if (!user) {
      toast.error("You must be logged in to create timers");
      return "";
    }

    try {
      const newTimer: Timer = {
        id: crypto.randomUUID(),
        name,
        elapsedTime: 0,
        isRunning: false,
        createdAt: new Date(),
        category,
      };
      
      // Optimistic update
      setTimers((prev) => [...prev, newTimer]);
      
      // Save to Supabase
      const { error } = await supabase
        .from('timers')
        .insert({
          id: newTimer.id,
          name: newTimer.name,
          elapsed_time: newTimer.elapsedTime,
          is_running: newTimer.isRunning,
          created_at: newTimer.createdAt.toISOString(),
          category: newTimer.category,
          user_id: user.id // Important: Set the user_id to satisfy RLS policy
        });
      
      if (error) {
        // Revert optimistic update if failed
        setTimers((prev) => prev.filter(t => t.id !== newTimer.id));
        toast.error("Failed to create timer");
        console.error("Error adding timer:", error);
        return "";
      }
      
      return newTimer.id;
    } catch (error) {
      console.error("Error adding timer:", error);
      toast.error("Failed to create timer");
      return "";
    }
  }, [user]);

  const toggleTimer = useCallback(async (id: string) => {
    if (!user) return;

    try {
      // Optimistic update
      setTimers((prev) =>
        prev.map((timer) =>
          timer.id === id
            ? { ...timer, isRunning: !timer.isRunning }
            : timer
        )
      );

      // Get updated timer
      const updatedTimer = timers.find(t => t.id === id);
      if (updatedTimer) {
        const newState = !updatedTimer.isRunning;
        
        // Update in Supabase
        const { error } = await supabase
          .from('timers')
          .update({
            is_running: newState
          })
          .eq('id', id);
        
        if (error) {
          // Revert optimistic update if failed
          setTimers((prev) =>
            prev.map((timer) =>
              timer.id === id
                ? { ...timer, isRunning: !newState }
                : timer
            )
          );
          toast.error("Failed to update timer");
          console.error("Error toggling timer:", error);
        }
      }
    } catch (error) {
      console.error("Error toggling timer:", error);
      toast.error("Failed to update timer");
    }
  }, [timers, user]);

  const resetTimer = useCallback(async (id: string) => {
    if (!user) return;

    try {
      // Optimistic update
      setTimers((prev) =>
        prev.map((timer) =>
          timer.id === id
            ? { ...timer, elapsedTime: 0, isRunning: false }
            : timer
        )
      );

      // Get updated timer
      const updatedTimer = timers.find(t => t.id === id);
      if (updatedTimer) {
        // Update in Supabase
        const { error } = await supabase
          .from('timers')
          .update({
            elapsed_time: 0,
            is_running: false
          })
          .eq('id', id);
        
        if (error) {
          // Revert optimistic update if failed
          setTimers((prev) => [...prev]); // Force re-render with original data
          toast.error("Failed to reset timer");
          console.error("Error resetting timer:", error);
        }
      }
    } catch (error) {
      console.error("Error resetting timer:", error);
      toast.error("Failed to reset timer");
    }
  }, [timers, user]);

  const deleteTimerById = useCallback(async (id: string) => {
    if (!user) return;

    try {
      // Store the timer before deletion for potential rollback
      const timerToDelete = timers.find(t => t.id === id);
      if (!timerToDelete) return;

      // Optimistic update
      setTimers((prev) => prev.filter((timer) => timer.id !== id));

      // Delete from Supabase
      const { error } = await supabase
        .from('timers')
        .delete()
        .eq('id', id);
      
      if (error) {
        // Revert optimistic update if failed
        setTimers((prev) => [...prev, timerToDelete]);
        toast.error("Failed to delete timer");
        console.error("Error deleting timer:", error);
      }
    } catch (error) {
      console.error("Error deleting timer:", error);
      toast.error("Failed to delete timer");
    }
  }, [timers, user]);

  const renameTimer = useCallback(async (id: string, newName: string, category?: string) => {
    if (!user) return;

    try {
      // Optimistic update
      setTimers((prev) =>
        prev.map((timer) =>
          timer.id === id
            ? { 
                ...timer, 
                name: newName, 
                isRunning: true,  // Start timer when confirmed
                category: category !== undefined ? category : timer.category // Only update category if provided
              }
            : timer
        )
      );

      // Get updated timer
      const originalTimer = timers.find(t => t.id === id);
      if (originalTimer) {
        // Update in Supabase
        const { error } = await supabase
          .from('timers')
          .update({
            name: newName,
            is_running: true,
            category: category !== undefined ? category : originalTimer.category
          })
          .eq('id', id);
        
        if (error) {
          // Revert optimistic update if failed
          setTimers((prev) => [...prev]); // Force re-render with original data
          toast.error("Failed to rename timer");
          console.error("Error renaming timer:", error);
        }
      }
    } catch (error) {
      console.error("Error renaming timer:", error);
      toast.error("Failed to rename timer");
    }
  }, [timers, user]);

  const updateDeadline = useCallback(async (id: string, deadline: Date | undefined) => {
    if (!user) return;

    try {
      // Optimistic update
      setTimers((prev) =>
        prev.map((timer) =>
          timer.id === id
            ? { ...timer, deadline }
            : timer
        )
      );

      // Get updated timer
      const originalTimer = timers.find(t => t.id === id);
      if (originalTimer) {
        // Update in Supabase
        const { error } = await supabase
          .from('timers')
          .update({
            deadline: deadline?.toISOString()
          })
          .eq('id', id);
        
        if (error) {
          // Revert optimistic update if failed
          setTimers((prev) => [...prev]); // Force re-render with original data
          toast.error("Failed to update deadline");
          console.error("Error updating deadline:", error);
        } else if (deadline) {
          toast.success("Deadline updated", { 
            description: `Deadline set for ${deadline.toLocaleDateString()} at ${deadline.toLocaleTimeString()}` 
          });
        }
      }
    } catch (error) {
      console.error("Error updating deadline:", error);
      toast.error("Failed to update deadline");
    }
  }, [timers, user]);

  const updatePriority = useCallback(async (id: string, priority: number | undefined) => {
    if (!user) return;

    try {
      // Optimistic update
      setTimers((prev) =>
        prev.map((timer) =>
          timer.id === id
            ? { ...timer, priority }
            : timer
        )
      );

      // Get updated timer
      const originalTimer = timers.find(t => t.id === id);
      if (originalTimer) {
        // Update in Supabase
        const { error } = await supabase
          .from('timers')
          .update({
            priority
          })
          .eq('id', id);
        
        if (error) {
          // Revert optimistic update if failed
          setTimers((prev) => [...prev]); // Force re-render with original data
          toast.error("Failed to update priority");
          console.error("Error updating priority:", error);
        } else if (priority !== undefined) {
          toast.success(`Priority set to ${priority}`, {
            description: priority === 1 ? "Highest priority" : priority === 5 ? "Lowest priority" : "",
          });
        }
      }
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error("Failed to update priority");
    }
  }, [timers, user]);

  const reorderTimers = useCallback(async (reorderedTimers: Timer[]) => {
    if (!user) return;
    
    try {
      // Find the timers that aren't in the reordered list and add them at the end
      const otherTimers = timers.filter(
        timer => !reorderedTimers.some(rt => rt.id === timer.id)
      );
      
      // Update locally first (optimistic update)
      setTimers([...reorderedTimers, ...otherTimers]);
      
      // We don't need to sync this to Supabase as our current approach for 
      // drag-and-drop doesn't rely on a position field in the database
    } catch (error) {
      console.error("Error reordering timers:", error);
      toast.error("Failed to reorder timers");
    }
  }, [timers, user]);

  return {
    timers,
    loading,
    addTimer,
    toggleTimer,
    resetTimer,
    deleteTimer: deleteTimerById,
    renameTimer,
    updateDeadline,
    updatePriority,
    reorderTimers,
  };
};
