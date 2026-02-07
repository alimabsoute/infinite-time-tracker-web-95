import { useState, useEffect, useRef, useCallback } from 'react';
import { Timer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ULTRA-SIMPLE timer system - no sessions, no complex persistence
// Just: timer.id -> stored_time + (running ? now - start : 0)

interface SimpleRunningTimer {
  id: string;
  startTime: number; // timestamp when started
}

export const useSimpleTimers = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Only track which timers are running and when they started
  const [runningTimers, setRunningTimers] = useState<SimpleRunningTimer[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Dead simple: get display time for any timer
  const getDisplayTime = useCallback((timer: Timer): number => {
    const runningTimer = runningTimers.find(rt => rt.id === timer.id);
    if (!runningTimer || !timer.isRunning) {
      return timer.elapsedTime; // Just use stored time
    }
    
    const sessionDuration = Date.now() - runningTimer.startTime;
    return timer.elapsedTime + sessionDuration;
  }, [runningTimers]);

  // Load timers from database
  const loadTimers = useCallback(async () => {
    if (!user) {
      setTimers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('timers')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading timers:', error);
        toast.error('Failed to load timers');
        return;
      }

      const processedTimers: Timer[] = data.map(timer => ({
        id: timer.id,
        name: timer.name,
        elapsedTime: timer.elapsed_time,
        isRunning: timer.is_running,
        createdAt: new Date(timer.created_at),
        deadline: timer.deadline ? new Date(timer.deadline) : undefined,
        category: timer.category || undefined,
        tags: timer.tags || undefined,
        priority: timer.priority || undefined,
        // No session fields needed!
      }));

      // Initialize running timers for any that are marked as running
      const currentlyRunning: SimpleRunningTimer[] = [];
      processedTimers.forEach(timer => {
        if (timer.isRunning) {
          // Calculate when this timer must have started based on its stored elapsed time
          // If it has been running continuously, startTime = now - elapsed_time
          const calculatedStartTime = Date.now() - timer.elapsedTime;
          currentlyRunning.push({
            id: timer.id,
            startTime: calculatedStartTime
          });
        }
      });

      setTimers(processedTimers);
      setRunningTimers(currentlyRunning);
    } catch (error) {
      console.error('❌ Error loading timers:', error);
      toast.error('Failed to load timers');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Start/stop timer
  const toggleTimer = useCallback(async (timerId: string) => {
    if (!user) return;

    const timer = timers.find(t => t.id === timerId);
    if (!timer) return;

    try {
      if (timer.isRunning) {
        // STOP: Calculate final time and save to database
        const runningTimer = runningTimers.find(rt => rt.id === timerId);
        const sessionDuration = runningTimer ? Date.now() - runningTimer.startTime : 0;
        const finalElapsedTime = timer.elapsedTime + sessionDuration;

        // Update database with final time
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
            ? { ...t, isRunning: false, elapsedTime: finalElapsedTime }
            : t
        ));

        // Remove from running timers
        setRunningTimers(prev => prev.filter(rt => rt.id !== timerId));

      } else {
        // START: Stop all other timers first, then start this one

        // Stop all currently running timers
        const updates = await Promise.all(
          runningTimers.map(async (rt) => {
            const runningTimer = timers.find(t => t.id === rt.id);
            if (runningTimer) {
              const sessionDuration = Date.now() - rt.startTime;
              const finalTime = runningTimer.elapsedTime + sessionDuration;
              
              await supabase
                .from('timers')
                .update({
                  elapsed_time: Math.floor(finalTime),
                  is_running: false
                })
                .eq('id', rt.id);
                
              return { id: rt.id, finalTime };
            }
            return null;
          })
        );

        // Start the selected timer
        await supabase
          .from('timers')
          .update({ is_running: true })
          .eq('id', timerId);

        // Update local state
        setTimers(prev => prev.map(t => {
          const update = updates.find(u => u?.id === t.id);
          if (t.id === timerId) {
            return { ...t, isRunning: true };
          } else if (update) {
            return { ...t, isRunning: false, elapsedTime: update.finalTime };
          }
          return t;
        }));

        // Set new running timer
        setRunningTimers([{ id: timerId, startTime: Date.now() }]);
      }

      toast.success(`Timer "${timer.name}" ${timer.isRunning ? 'stopped' : 'started'}`);
    } catch (error) {
      console.error('❌ Error toggling timer:', error);
      toast.error('Failed to toggle timer');
      loadTimers(); // Reload on error
    }
  }, [user, timers, runningTimers, loadTimers]);

  // Reset timer
  const resetTimer = useCallback(async (timerId: string) => {
    if (!user) return;

    try {
      // Update database
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
          ? { ...t, elapsedTime: 0, isRunning: false }
          : t
      ));

      // Remove from running timers
      setRunningTimers(prev => prev.filter(rt => rt.id !== timerId));

      toast.success('Timer reset');
    } catch (error) {
      console.error('❌ Error resetting timer:', error);
      toast.error('Failed to reset timer');
    }
  }, [user]);

  // Add timer
  const addTimer = useCallback(async (name: string) => {
    if (!user) return;

    try {
      const newTimer = {
        name,
        user_id: user.id,
        elapsed_time: 0,
        is_running: false,
      };

      const { data, error } = await supabase
        .from('timers')
        .insert(newTimer)
        .select()
        .single();

      if (error) throw error;

      const processedTimer: Timer = {
        id: data.id,
        name: data.name,
        elapsedTime: data.elapsed_time,
        isRunning: data.is_running,
        createdAt: new Date(data.created_at),
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        category: data.category || undefined,
        tags: data.tags || undefined,
        priority: data.priority || undefined,
      };

      setTimers(prev => [processedTimer, ...prev]);
      toast.success(`Timer "${name}" created`);
    } catch (error) {
      console.error('❌ Error creating timer:', error);
      toast.error('Failed to create timer');
    }
  }, [user]);

  // Enhanced interval for display updates AND periodic persistence
  useEffect(() => {
    if (runningTimers.length > 0) {
      intervalRef.current = setInterval(() => {
        // Force re-render for display updates
        setTimers(prev => [...prev]);
        
        // Periodic persistence every 30 seconds to prevent data loss
        const now = Date.now();
        runningTimers.forEach(async (runningTimer) => {
          const timer = timers.find(t => t.id === runningTimer.id);
          if (timer && timer.isRunning) {
            const sessionDuration = now - runningTimer.startTime;
            const currentElapsedTime = timer.elapsedTime + sessionDuration;
            
            // Save to database every 30 seconds (30000ms)
            if (sessionDuration % 30000 < 1000) {
              await supabase
                .from('timers')
                .update({ elapsed_time: Math.floor(currentElapsedTime) })
                .eq('id', timer.id);
            }
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [runningTimers.length, runningTimers, timers]);

  // Load timers on mount
  useEffect(() => {
    loadTimers();
  }, [loadTimers]);

  return {
    timers,
    loading,
    addTimer,
    toggleTimer,
    resetTimer,
    getDisplayTime,
  };
};