import { useState, useEffect, useCallback, useRef } from "react";
import { Timer, TimerSession } from "../types";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import { toast } from "sonner";
import { useBrowserEvents } from "./useBrowserEvents";
import { useTimerPersistence } from "./useTimerPersistence";
import { useTimerSync } from "./useTimerSync";

export const useTimers = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const [confettiTrigger, setConfettiTrigger] = useState<{ x: number; y: number; id: string } | null>(null);
  const confettiTimeoutRef = useRef<NodeJS.Timeout>();
  const { user } = useAuth();
  const { canCreateTimer, getTimerLimit } = useSubscription();
  
  // Persistence and sync hooks
  const { saveTimerState, loadTimerState, clearTimerState, restoreTimerElapsedTime } = useTimerPersistence();
  const { batchSyncTimers } = useTimerSync();
  
  // Refs for tracking state
  const isPageVisibleRef = useRef(true);
  const timersRef = useRef<Timer[]>([]);
  const lastAutoSaveRef = useRef(0);

  // Update timers ref when timers change
  useEffect(() => {
    timersRef.current = timers;
  }, [timers]);

  // Clear confetti trigger function
  const clearConfettiTrigger = useCallback(() => {
    console.log('🧹 Clearing confetti trigger');
    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current);
    }
    setConfettiTrigger(null);
  }, []);

  // Browser event handlers
  const browserEventHandlers = {
    onVisibilityChange: useCallback((isVisible: boolean) => {
      isPageVisibleRef.current = isVisible;
      
      if (!isVisible) {
        // Page hidden - save state and sync to database
        saveTimerState(timersRef.current, 'visibility');
        batchSyncTimers(timersRef.current, true);
      } else {
        // Page visible - restore any missed time
        const persistenceData = loadTimerState();
        if (persistenceData) {
          setTimers(prevTimers => {
            const restoredTimers = restoreTimerElapsedTime(prevTimers, persistenceData);
            // Sync restored timers to database
            batchSyncTimers(restoredTimers, true);
            return restoredTimers;
          });
        }
      }
    }, [saveTimerState, batchSyncTimers, loadTimerState, restoreTimerElapsedTime]),

    onBeforeUnload: useCallback(() => {
      // Critical save before page unload
      saveTimerState(timersRef.current, 'beforeunload');
      // Force immediate sync to database
      const runningTimers = timersRef.current.filter(t => t.isRunning);
      if (runningTimers.length > 0) {
        // Use navigator.sendBeacon for reliable data sending during unload
        const syncData = runningTimers.map(timer => ({
          id: timer.id,
          elapsed_time: timer.elapsedTime,
          is_running: timer.isRunning
        }));
        
        try {
          // Attempt synchronous update for critical case
          navigator.sendBeacon('/api/sync-timers', JSON.stringify(syncData));
        } catch (error) {
          console.error('Failed to send beacon:', error);
        }
      }
    }, [saveTimerState]),

    onPageHide: useCallback(() => {
      // More reliable than beforeunload on mobile
      saveTimerState(timersRef.current, 'pagehide');
      batchSyncTimers(timersRef.current, true);
    }, [saveTimerState, batchSyncTimers]),

    onPageShow: useCallback(() => {
      // Restore state when page becomes visible again
      const persistenceData = loadTimerState();
      if (persistenceData) {
        setTimers(prevTimers => {
          const restoredTimers = restoreTimerElapsedTime(prevTimers, persistenceData);
          batchSyncTimers(restoredTimers, true);
          return restoredTimers;
        });
      }
    }, [loadTimerState, restoreTimerElapsedTime, batchSyncTimers]),

    onFocus: useCallback(() => {
      // Window focused - check for timer restoration
      const persistenceData = loadTimerState();
      if (persistenceData) {
        setTimers(prevTimers => restoreTimerElapsedTime(prevTimers, persistenceData));
      }
    }, [loadTimerState, restoreTimerElapsedTime]),

    onBlur: useCallback(() => {
      // Window lost focus - save current state
      saveTimerState(timersRef.current, 'blur');
    }, [saveTimerState])
  };

  // Register browser event handlers
  useBrowserEvents(browserEventHandlers);

  // Auto-save timer state periodically
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastSave = now - lastAutoSaveRef.current;
      
      // Auto-save every 30 seconds if there are running timers
      if (timeSinceLastSave > 30000) {
        const runningTimers = timersRef.current.filter(t => t.isRunning);
        if (runningTimers.length > 0) {
          saveTimerState(timersRef.current, 'manual');
          lastAutoSaveRef.current = now;
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(autoSaveInterval);
  }, [saveTimerState]);

  // Load timers from Supabase on initial render and when user changes
  useEffect(() => {
    // Don't fetch if there's no user
    if (!user) {
      setTimers([]);
      setLoading(false);
      clearTimerState();
      return;
    }

    const loadTimers = async () => {
      try {
        setLoading(true);
        // Only fetch non-deleted timers for the main timer functionality
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
          // For timers that are running, we need to fetch their open session
          currentSessionId: undefined, // This will be populated below
          sessionStartTime: undefined,
        }));
        
        // Find any open sessions for the loaded timers
        const runningTimerIds = processedTimers.filter(t => t.isRunning).map(t => t.id);
        if (runningTimerIds.length > 0) {
          const { data: openSessions, error: sessionError } = await supabase
            .from('timer_sessions')
            .select('*')
            .in('timer_id', runningTimerIds)
            .is('end_time', null);

          if (sessionError) {
            console.error("Error fetching open sessions:", sessionError);
          } else if (openSessions) {
            processedTimers.forEach(timer => {
              const openSession = openSessions.find(s => s.timer_id === timer.id);
              if (openSession) {
                timer.currentSessionId = openSession.id;
                timer.sessionStartTime = new Date(openSession.start_time);
              }
            });
          }
        }
        
        // Check for saved running timer states from previous session
        const persistenceData = loadTimerState();
        if (persistenceData) {
          const restoredTimers = restoreTimerElapsedTime(processedTimers, persistenceData);
          
          // Clear persistence data since we've restored
          clearTimerState();
          
          // Sync restored timers to database
          batchSyncTimers(restoredTimers, true);
          
          setTimers(restoredTimers);
          
          // Show notification about restored timers
          const restoredCount = persistenceData.timers.length;
          if (restoredCount > 0) {
            toast.success(`Welcome back!`, {
              description: `${restoredCount} timer${restoredCount > 1 ? 's were' : ' was'} running while you were away`
            });
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
  }, [user, loadTimerState, restoreTimerElapsedTime, clearTimerState, batchSyncTimers]);

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
              .is('deleted_at', null)
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
            // For updates, only apply non-time related changes and only if not deleted
            const { data, error } = await supabase
              .from('timers')
              .select('*')
              .eq('id', payload.new.id)
              .single();

            if (error || !data || data.deleted_at) {
              // If timer was soft deleted, remove it from the active timers list
              if (data?.deleted_at) {
                setTimers(prevTimers => prevTimers.filter(timer => timer.id !== data.id));
              }
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

        // Save state periodically while timers are running
        const runningTimers = updatedTimers.filter(t => t.isRunning);
        if (runningTimers.length > 0) {
          // Save to localStorage every 10 seconds
          const now = Date.now();
          if (now - lastAutoSaveRef.current > 10000) {
            saveTimerState(updatedTimers, 'manual');
            lastAutoSaveRef.current = now;
          }
          
          // Sync to database every 5 seconds for running timers only if page is visible
          if (isPageVisibleRef.current && now % 5000 < 1000) {
            batchSyncTimers(updatedTimers);
          }
        }

        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user, saveTimerState, batchSyncTimers]);

  const addTimer = useCallback(async (name: string, category?: string): Promise<string> => {
    if (!user) {
      toast.error("You must be logged in to create timers");
      return "";
    }

    // Check subscription limits before adding timer
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
        isRunning: true, // Start the new timer immediately
        createdAt: new Date(),
        category,
        sessionStartTime: new Date(),
      };
      
      console.log('➕ Adding new timer:', newTimer.name);
      
      const newSession: Omit<TimerSession, 'id'> & { id?: string } = {
        timer_id: newTimer.id,
        start_time: newTimer.sessionStartTime.toISOString(),
        user_id: user.id
      };
      
      const runningTimers = timers.filter(t => t.isRunning);
      
      // --- Optimistic Update ---
      const newSessionId = crypto.randomUUID();
      newTimer.currentSessionId = newSessionId;
      newSession.id = newSessionId;

      setTimers((prev) => [
        newTimer,
        ...prev.map(timer => timer.isRunning ? { ...timer, isRunning: false, currentSessionId: undefined, sessionStartTime: undefined } : timer)
      ]);
      
      // --- Database Operations ---
      const updates = [];
      
      // 1. End sessions for all currently running timers
      const now = new Date();
      runningTimers.forEach(timer => {
        if (timer.currentSessionId && timer.sessionStartTime) {
          const duration = now.getTime() - timer.sessionStartTime.getTime();
          updates.push(
            supabase.from('timer_sessions').update({
              end_time: now.toISOString(),
              duration_ms: duration,
            }).eq('id', timer.currentSessionId)
          );
          updates.push(
            supabase.from('timers').update({
              is_running: false,
              elapsed_time: timer.elapsedTime + duration,
            }).eq('id', timer.id)
          );
        }
      });
      
      // 2. Insert the new timer
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

      // 3. Insert the new session
      updates.push(
        supabase.from('timer_sessions').insert({ ...newSession, id: newSession.id! })
      );
      
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
      
      // Clear any existing confetti trigger
      clearConfettiTrigger();
      
      // Trigger confetti animation at center of screen
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      console.log('🎉 Triggering confetti at:', { x: centerX, y: centerY });
      setConfettiTrigger({ x: centerX, y: centerY, id: newTimer.id });
      
      // Auto-clear confetti after 4 seconds as fallback
      confettiTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Auto-clearing confetti after timeout');
        setConfettiTrigger(null);
      }, 4000);
      
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
  }, [user, timers, clearConfettiTrigger, canCreateTimer, getTimerLimit]);

  // New function to start a timer and pause all others
  const startTimerAndPauseOthers = useCallback(async (id: string) => {
    if (!user) return;
    const now = new Date();
    const newSessionId = crypto.randomUUID();

    try {
      const runningTimers = timers.filter(t => t.isRunning && t.id !== id);
      
      // --- Optimistic Update ---
      setTimers((prev) =>
        prev.map((timer) => {
          if (timer.id === id) {
            return { ...timer, isRunning: true, currentSessionId: newSessionId, sessionStartTime: now };
          } else if (timer.isRunning) {
            return { ...timer, isRunning: false, currentSessionId: undefined, sessionStartTime: undefined };
          }
          return timer;
        })
      );

      // --- Database Operations ---
      const updates = [];
      
      // 1. Start session for the target timer
      updates.push(
        supabase.from('timer_sessions').insert({
          id: newSessionId,
          timer_id: id,
          start_time: now.toISOString(),
          user_id: user.id
        })
      );
      updates.push(
        supabase.from('timers').update({ is_running: true }).eq('id', id)
      );

      // 2. End sessions for all other running timers
      runningTimers.forEach(timer => {
        if (timer.currentSessionId && timer.sessionStartTime) {
          const duration = now.getTime() - timer.sessionStartTime.getTime();
          updates.push(
            supabase.from('timer_sessions').update({
              end_time: now.toISOString(),
              duration_ms: duration,
            }).eq('id', timer.currentSessionId)
          );
          updates.push(
            supabase.from('timers').update({
              is_running: false,
              elapsed_time: timer.elapsedTime + duration,
            }).eq('id', timer.id)
          );
        }
      });

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

      if (newRunningState) { // --- STARTING TIMER ---
        const now = new Date();
        const newSessionId = crypto.randomUUID();

        // Optimistic update
        setTimers((prev) =>
          prev.map((timer) =>
            timer.id === id
              ? { ...timer, isRunning: true, currentSessionId: newSessionId, sessionStartTime: now }
              : timer
          )
        );
        
        // DB update
        await supabase.from('timer_sessions').insert({
          id: newSessionId,
          timer_id: id,
          start_time: now.toISOString(),
          user_id: user.id
        });
        await supabase.from('timers').update({ is_running: true }).eq('id', id);
        
        toast.success("Timer started");

      } else { // --- PAUSING TIMER ---
        if (!targetTimer.currentSessionId || !targetTimer.sessionStartTime) {
          console.warn("Attempted to stop a timer with no active session.");
          // Force stop it anyway
          setTimers(prev => prev.map(t => t.id === id ? { ...t, isRunning: false } : t));
          await supabase.from('timers').update({ is_running: false }).eq('id', id);
          toast.success("Timer paused");
          return;
        }

        const now = new Date();
        const duration = now.getTime() - targetTimer.sessionStartTime.getTime();
        const newElapsedTime = targetTimer.elapsedTime + duration;

        // Optimistic update
        setTimers((prev) =>
          prev.map((timer) =>
            timer.id === id
              ? { ...timer, isRunning: false, elapsedTime: newElapsedTime, currentSessionId: undefined, sessionStartTime: undefined }
              : timer
          )
        );

        // DB update
        await supabase.from('timer_sessions').update({
          end_time: now.toISOString(),
          duration_ms: duration
        }).eq('id', targetTimer.currentSessionId);

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
  }, [timers, user]);

  const resetTimer = useCallback(async (id: string) => {
    if (!user) return;
// ... keep existing code (try block)
      const timerToReset = timers.find(t => t.id === id);

      // Optimistic update
      setTimers((prev) =>
        prev.map((timer) =>
          timer.id === id
            ? { ...timer, elapsedTime: 0, isRunning: false, currentSessionId: undefined, sessionStartTime: undefined }
            : timer
        )
      );

      // End any running session
      if (timerToReset?.isRunning && timerToReset.currentSessionId && timerToReset.sessionStartTime) {
        const now = new Date();
        const duration = now.getTime() - timerToReset.sessionStartTime.getTime();
        await supabase.from('timer_sessions').update({
          end_time: now.toISOString(),
          duration_ms: duration
        }).eq('id', timerToReset.currentSessionId);
      }

      // Update timer in Supabase
      const { error } = await supabase
        .from('timers')
        .update({
          elapsed_time: 0,
          is_running: false
        })
        .eq('id', id);
// ... keep existing code (error handling)
  }, [timers, user]);

  const deleteTimerById = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const timerToDelete = timers.find(t => t.id === id);
      if (!timerToDelete) return;

      // End any running session before deleting
      if (timerToDelete.isRunning && timerToDelete.currentSessionId && timerToDelete.sessionStartTime) {
        const now = new Date();
        const duration = now.getTime() - timerToDelete.sessionStartTime.getTime();
        await supabase.from('timer_sessions').update({
          end_time: now.toISOString(),
          duration_ms: duration
        }).eq('id', timerToDelete.currentSessionId);
        await supabase.from('timers').update({
          elapsed_time: timerToDelete.elapsedTime + duration
        }).eq('id', id);
      }
// ... keep existing code (optimistic update and soft delete logic)
    } catch (error) {
      console.error("Error deleting timer:", error);
      toast.error("Failed to delete timer");
    }
  }, [timers, user]);

  // renameTimer, updateDeadline, updatePriority, reorderTimers don't need session logic
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
    confettiTrigger,
    clearConfettiTrigger,
  };
};
