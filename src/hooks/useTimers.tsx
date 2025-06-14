import { useState, useEffect, useCallback } from "react";
import { Timer } from "../types";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export const useTimers = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Save running timers to localStorage when user logs out
  useEffect(() => {
    const saveRunningTimersOnLogout = () => {
      const runningTimers = timers.filter(t => t.isRunning);
      if (runningTimers.length > 0) {
        const timerStates = runningTimers.map(timer => ({
          id: timer.id,
          logoutTime: Date.now(),
          elapsedTimeAtLogout: timer.elapsedTime
        }));
        localStorage.setItem('runningTimersState', JSON.stringify(timerStates));
      }
    };

    // Listen for auth state changes to detect logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && timers.length > 0) {
        saveRunningTimersOnLogout();
      }
    });

    return () => subscription.unsubscribe();
  }, [timers]);

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
        
        // Check for saved running timer states from previous session
        const savedTimerStates = localStorage.getItem('runningTimersState');
        if (savedTimerStates) {
          try {
            const timerStates = JSON.parse(savedTimerStates);
            const currentTime = Date.now();
            
            // Update timers with accumulated time from offline period
            const updatedTimers = processedTimers.map(timer => {
              const savedState = timerStates.find((state: any) => state.id === timer.id);
              if (savedState && timer.isRunning) {
                const offlineTime = currentTime - savedState.logoutTime;
                const newElapsedTime = savedState.elapsedTimeAtLogout + offlineTime;
                
                // Update the timer in Supabase with the new elapsed time
                supabase
                  .from('timers')
                  .update({ elapsed_time: newElapsedTime })
                  .eq('id', timer.id)
                  .then(({ error }) => {
                    if (error) console.error("Error updating timer after restoration:", error);
                  });
                
                return { ...timer, elapsedTime: newElapsedTime };
              }
              return timer;
            });
            
            // Clear the saved state since we've restored the timers
            localStorage.removeItem('runningTimersState');
            
            setTimers(updatedTimers);
            
            // Show notification about restored timers
            const restoredCount = timerStates.length;
            if (restoredCount > 0) {
              toast.success(`Welcome back!`, {
                description: `${restoredCount} timer${restoredCount > 1 ? 's were' : ' was'} running while you were away`
              });
            }
          } catch (parseError) {
            console.error("Error parsing saved timer states:", parseError);
            localStorage.removeItem('runningTimersState');
            setTimers(processedTimers);
          }
        } else {
          setTimers(processedTimers);
        }
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
        async (payload) => {
          // Only fetch all timers if there's a new timer or deletion
          // For updates, we'll handle them more selectively to avoid interrupting running timers
          if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
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
            
            // Update timers while preserving the elapsed time of running timers
            setTimers(prevTimers => {
              const runningTimers = prevTimers.filter(t => t.isRunning);
              
              // Merge running timers' current time with new data
              return processedTimers.map(newTimer => {
                const runningTimer = runningTimers.find(rt => rt.id === newTimer.id);
                if (runningTimer && newTimer.isRunning) {
                  // Keep the elapsed time from our running state for continuity
                  return { ...newTimer, elapsedTime: runningTimer.elapsedTime };
                }
                return newTimer;
              });
            });
          } else if (payload.eventType === 'UPDATE') {
            // For updates, only apply non-time related changes
            const { data, error } = await supabase
              .from('timers')
              .select('*')
              .eq('id', payload.new.id)
              .single();

            if (error || !data) {
              console.error("Error fetching updated timer:", error);
              return;
            }

            // Apply update to a single timer without resetting elapsed time if running
            setTimers(prevTimers => {
              return prevTimers.map(timer => {
                if (timer.id === data.id) {
                  // Preserve current elapsed time if timer is running
                  const preservedElapsedTime = timer.isRunning ? timer.elapsedTime : data.elapsed_time;
                  
                  return {
                    ...timer,
                    name: data.name,
                    isRunning: data.is_running,
                    category: data.category || undefined,
                    deadline: data.deadline ? new Date(data.deadline) : undefined,
                    priority: data.priority || undefined,
                    // Only update elapsed time if timer is not running
                    elapsedTime: preservedElapsedTime
                  };
                }
                return timer;
              });
            });
          }
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

        // If any timers were updated, sync with Supabase less frequently to reduce interruptions
        // We'll do this every 5 seconds instead of every second
        const runningTimers = updatedTimers.filter(t => t.isRunning);
        if (runningTimers.length > 0 && Date.now() % 5000 < 1000) {
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
        isRunning: true, // Start the new timer immediately
        createdAt: new Date(),
        category,
      };
      
      // Get currently running timers before optimistic update
      const runningTimers = timers.filter(t => t.isRunning);
      
      // Optimistic update - add new timer and pause all existing running timers
      setTimers((prev) => [
        newTimer,
        ...prev.map(timer => timer.isRunning ? { ...timer, isRunning: false } : timer)
      ]);
      
      // Prepare batch updates for Supabase
      const updates = [];
      
      // Add the new timer
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
      
      // Pause all currently running timers
      runningTimers.forEach(timer => {
        updates.push(
          supabase
            .from('timers')
            .update({ is_running: false })
            .eq('id', timer.id)
        );
      });
      
      // Execute all updates
      const results = await Promise.all(updates);
      
      // Check for any errors
      const hasErrors = results.some(result => result.error);
      
      if (hasErrors) {
        // Revert optimistic update if failed
        setTimers((prev) => prev.filter(t => t.id !== newTimer.id));
        toast.error("Failed to create timer");
        console.error("Error adding timer and pausing others");
        return "";
      }
      
      // Show success message
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
  }, [user, timers]);

  // New function to start a timer and pause all others
  const startTimerAndPauseOthers = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const runningTimers = timers.filter(t => t.isRunning && t.id !== id);
      
      // Optimistic update - pause all running timers except the target one
      setTimers((prev) =>
        prev.map((timer) => {
          if (timer.id === id) {
            return { ...timer, isRunning: true };
          } else if (timer.isRunning) {
            return { ...timer, isRunning: false };
          }
          return timer;
        })
      );

      // Batch update in Supabase - pause all running timers and start the target timer
      const updates = [];
      
      // Add update for target timer
      updates.push(
        supabase
          .from('timers')
          .update({ is_running: true })
          .eq('id', id)
      );

      // Add updates for all currently running timers to pause them
      runningTimers.forEach(timer => {
        updates.push(
          supabase
            .from('timers')
            .update({ is_running: false })
            .eq('id', timer.id)
        );
      });

      // Execute all updates
      const results = await Promise.all(updates);
      
      // Check for any errors
      const hasErrors = results.some(result => result.error);
      
      if (hasErrors) {
        // Revert optimistic update if any failed
        setTimers((prev) => [...prev]); // Force re-render with original data
        toast.error("Failed to update timers");
        console.error("Error in batch timer update");
        return;
      }

      // Show success message
      if (runningTimers.length > 0) {
        toast.success(`Timer started`, {
          description: `${runningTimers.length} other timer${runningTimers.length > 1 ? 's' : ''} paused automatically`
        });
      } else {
        toast.success("Timer started");
      }

    } catch (error) {
      console.error("Error starting timer and pausing others:", error);
      toast.error("Failed to update timers");
    }
  }, [timers, user]);

  const toggleTimer = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const targetTimer = timers.find(t => t.id === id);
      if (!targetTimer) return;

      const newRunningState = !targetTimer.isRunning;

      // Optimistic update - just toggle this timer without affecting others
      setTimers((prev) =>
        prev.map((timer) =>
          timer.id === id
            ? { ...timer, isRunning: newRunningState }
            : timer
        )
      );

      // Update in Supabase
      const { error } = await supabase
        .from('timers')
        .update({
          is_running: newRunningState
        })
        .eq('id', id);
      
      if (error) {
        // Revert optimistic update if failed
        setTimers((prev) =>
          prev.map((timer) =>
            timer.id === id
              ? { ...timer, isRunning: !newRunningState }
              : timer
          )
        );
        toast.error("Failed to update timer");
        console.error("Error toggling timer:", error);
      } else {
        toast.success(newRunningState ? "Timer started" : "Timer paused");
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
      // Find the timer to preserve its running state
      const timerToUpdate = timers.find(t => t.id === id);
      if (!timerToUpdate) return;
      
      // Keep its running state rather than forcing it to start
      const isCurrentlyRunning = timerToUpdate.isRunning;

      // Optimistic update
      setTimers((prev) =>
        prev.map((timer) =>
          timer.id === id
            ? { 
                ...timer, 
                name: newName, 
                isRunning: isCurrentlyRunning,  // Preserve running state
                category: category !== undefined ? category : timer.category
              }
            : timer
        )
      );

      // Update in Supabase
      const { error } = await supabase
        .from('timers')
        .update({
          name: newName,
          is_running: isCurrentlyRunning, // Preserve running state
          category: category !== undefined ? category : timerToUpdate.category
        })
        .eq('id', id);
      
      if (error) {
        // Revert optimistic update if failed
        setTimers((prev) => [...prev]); // Force re-render with original data
        toast.error("Failed to rename timer");
        console.error("Error renaming timer:", error);
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
    startTimerAndPauseOthers, // Export the new function for direct use if needed
  };
};
