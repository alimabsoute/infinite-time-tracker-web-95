
import { useState, useEffect, useCallback } from "react";
import { Timer } from "../types";
import { 
  fetchTimers,
  createTimer,
  updateTimer,
  deleteTimer,
  subscribeToTimers
} from "../lib/supabase";
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
        const data = await fetchTimers();
        // Process dates to ensure they're Date objects
        const processedTimers = data.map(timer => ({
          ...timer,
          createdAt: new Date(timer.createdAt),
          deadline: timer.deadline ? new Date(timer.deadline) : undefined,
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

    const unsubscribe = subscribeToTimers((updatedTimers) => {
      // Process dates to ensure they're Date objects
      const processedTimers = updatedTimers.map(timer => ({
        ...timer,
        createdAt: new Date(timer.createdAt),
        deadline: timer.deadline ? new Date(timer.deadline) : undefined,
      }));
      setTimers(processedTimers);
    });

    return () => {
      unsubscribe();
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
            updateTimer(timer).catch(err => 
              console.error("Error updating timer:", err)
            );
          });
        }

        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const addTimer = useCallback(async (name: string, category?: string) => {
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
      const success = await createTimer(newTimer);
      
      if (!success) {
        // Revert optimistic update if failed
        setTimers((prev) => prev.filter(t => t.id !== newTimer.id));
        toast.error("Failed to create timer");
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
        const success = await updateTimer({
          ...updatedTimer,
          isRunning: newState
        });
        
        if (!success) {
          // Revert optimistic update if failed
          setTimers((prev) =>
            prev.map((timer) =>
              timer.id === id
                ? { ...timer, isRunning: !newState }
                : timer
            )
          );
          toast.error("Failed to update timer");
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
        const success = await updateTimer({
          ...updatedTimer,
          elapsedTime: 0,
          isRunning: false
        });
        
        if (!success) {
          // Revert optimistic update if failed
          setTimers((prev) => [...prev]); // Force re-render with original data
          toast.error("Failed to reset timer");
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
      const success = await deleteTimer(id);
      
      if (!success) {
        // Revert optimistic update if failed
        setTimers((prev) => [...prev, timerToDelete]);
        toast.error("Failed to delete timer");
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
        const success = await updateTimer({
          ...originalTimer,
          name: newName,
          isRunning: true,
          category: category !== undefined ? category : originalTimer.category
        });
        
        if (!success) {
          // Revert optimistic update if failed
          setTimers((prev) => [...prev]); // Force re-render with original data
          toast.error("Failed to rename timer");
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
        const success = await updateTimer({
          ...originalTimer,
          deadline
        });
        
        if (!success) {
          // Revert optimistic update if failed
          setTimers((prev) => [...prev]); // Force re-render with original data
          toast.error("Failed to update deadline");
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
        const success = await updateTimer({
          ...originalTimer,
          priority
        });
        
        if (!success) {
          // Revert optimistic update if failed
          setTimers((prev) => [...prev]); // Force re-render with original data
          toast.error("Failed to update priority");
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
