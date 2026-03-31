import { useState, useEffect, useRef, useCallback } from 'react';
import { Timer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@shared/lib/supabase/client';
import { toast } from 'sonner';
import { useTimerAnimations } from './useTimerAnimations';

// DEAD SIMPLE: elapsed_time + start_time (when running) = total time

export const useDeadSimpleTimers = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout>();
  
  // Animation system integration
  const {
    confettiTrigger,
    celebrationTrigger,
    setConfettiTrigger,
    setCelebrationTrigger,
    clearConfettiTrigger,
    clearCelebrationTrigger
  } = useTimerAnimations();

  // Get display time for any timer
  const getDisplayTime = useCallback((timer: Timer): number => {
    if (!timer.isRunning || !timer.startTime) {
      return timer.elapsedTime;
    }
    
    const sessionDuration = Date.now() - timer.startTime.getTime();
    return timer.elapsedTime + sessionDuration;
  }, []);

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
        console.error('Error loading timers:', error);
        toast.error('Failed to load timers');
        return;
      }

      const processedTimers: Timer[] = data.map(timer => ({
        id: timer.id,
        name: timer.name,
        elapsedTime: timer.elapsed_time,
        isRunning: timer.is_running,
        startTime: timer.start_time ? new Date(timer.start_time) : undefined,
        createdAt: new Date(timer.created_at),
        deadline: timer.deadline ? new Date(timer.deadline) : undefined,
        category: timer.category || undefined,
        tags: timer.tags || undefined,
        priority: timer.priority || undefined,
      }));

      setTimers(processedTimers);
    } catch (error) {
      console.error('Error loading timers:', error);
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
        // STOP: Calculate final time and save
        const finalElapsedTime = getDisplayTime(timer);


        // End the current session
        await supabase
          .from('timer_sessions')
          .update({
            end_time: new Date().toISOString(),
            duration_ms: Math.floor(finalElapsedTime - timer.elapsedTime)
          })
          .eq('timer_id', timerId)
          .is('end_time', null);

        await supabase
          .from('timers')
          .update({
            elapsed_time: Math.floor(finalElapsedTime),
            is_running: false,
            start_time: null
          })
          .eq('id', timerId);

        // Update local state
        setTimers(prev => prev.map(t => 
          t.id === timerId 
            ? { ...t, isRunning: false, elapsedTime: finalElapsedTime, startTime: undefined }
            : t
        ));

      } else {
        // START: Start this timer (allow multiple simultaneous timers)

        // Create new session
        const startTime = new Date();
        await supabase
          .from('timer_sessions')
          .insert({
            timer_id: timerId,
            user_id: user.id,
            start_time: startTime.toISOString()
          });

        await supabase
          .from('timers')
          .update({
            is_running: true,
            start_time: startTime.toISOString()
          })
          .eq('id', timerId);

        // Update local state
        setTimers(prev => prev.map(t => 
          t.id === timerId 
            ? { ...t, isRunning: true, startTime }
            : t
        ));
      }

      toast.success(`Timer "${timer.name}" ${timer.isRunning ? 'stopped' : 'started'}`);
    } catch (error) {
      console.error('Error toggling timer:', error);
      toast.error('Failed to toggle timer');
      loadTimers(); // Reload on error
    }
  }, [user, timers, getDisplayTime, loadTimers]);

  // Reset timer
  const resetTimer = useCallback(async (timerId: string) => {
    if (!user) return;

    try {

      await supabase
        .from('timers')
        .update({
          elapsed_time: 0,
          is_running: false,
          start_time: null
        })
        .eq('id', timerId);

      setTimers(prev => prev.map(t => 
        t.id === timerId 
          ? { ...t, elapsedTime: 0, isRunning: false, startTime: undefined }
          : t
      ));

      toast.success('Timer reset');
    } catch (error) {
      console.error('Error resetting timer:', error);
      toast.error('Failed to reset timer');
    }
  }, [user]);

  // Add timer with animation support
  const addTimer = useCallback(async (name: string, position?: { x: number; y: number }) => {
    if (!user) return;

    try {
      const newTimer = {
        name,
        user_id: user.id,
        elapsed_time: 0,
        is_running: false,
        start_time: null,
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
        startTime: data.start_time ? new Date(data.start_time) : undefined,
        createdAt: new Date(data.created_at),
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        category: data.category || undefined,
        tags: data.tags || undefined,
        priority: data.priority || undefined,
      };

      setTimers(prev => [processedTimer, ...prev]);
      toast.success(`Timer "${name}" created`);
      
      // Trigger animations if position provided
      if (position) {
        setConfettiTrigger({ x: position.x, y: position.y, id: processedTimer.id });
        const celebrations: ('fireworks' | 'sparkles' | 'balloons' | 'animals')[] = ['fireworks', 'sparkles', 'balloons', 'animals'];
        const randomCelebration = celebrations[Math.floor(Math.random() * celebrations.length)];
        setCelebrationTrigger({ type: randomCelebration });
      }
    } catch (error) {
      console.error('Error creating timer:', error);
      toast.error('Failed to create timer');
    }
  }, [user]);

  // Rename timer
  const renameTimer = useCallback(async (id: string, newName: string, category?: string) => {
    if (!user) return;

    try {

      await supabase
        .from('timers')
        .update({
          name: newName,
          category: category || null
        })
        .eq('id', id);

      setTimers(prev => prev.map(t => 
        t.id === id 
          ? { ...t, name: newName, category }
          : t
      ));

      toast.success(`Timer renamed to "${newName}"`);
    } catch (error) {
      console.error('Error renaming timer:', error);
      toast.error('Failed to rename timer');
    }
  }, [user]);

  // Delete timer
  const deleteTimer = useCallback(async (id: string) => {
    if (!user) return;

    const timer = timers.find(t => t.id === id);
    if (!timer) return;

    try {

      // Stop timer if running and end its session
      if (timer.isRunning) {
        const finalElapsedTime = getDisplayTime(timer);
        
        await supabase
          .from('timers')
          .update({
            elapsed_time: Math.floor(finalElapsedTime),
            is_running: false,
            start_time: null
          })
          .eq('id', id);

        // End current session if exists
        await supabase
          .from('timer_sessions')
          .update({
            end_time: new Date().toISOString(),
            duration_ms: Math.floor(finalElapsedTime)
          })
          .eq('timer_id', id)
          .is('end_time', null);
      }

      // Soft delete timer
      await supabase
        .from('timers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      setTimers(prev => prev.filter(t => t.id !== id));
      toast.success(`Timer "${timer.name}" deleted`);
    } catch (error) {
      console.error('Error deleting timer:', error);
      toast.error('Failed to delete timer');
    }
  }, [user, timers, getDisplayTime]);

  // Update deadline
  const updateDeadline = useCallback(async (id: string, deadline: Date | undefined) => {
    if (!user) return;

    try {

      await supabase
        .from('timers')
        .update({
          deadline: deadline ? deadline.toISOString() : null
        })
        .eq('id', id);

      setTimers(prev => prev.map(t => 
        t.id === id 
          ? { ...t, deadline }
          : t
      ));

      toast.success('Deadline updated');
    } catch (error) {
      console.error('Error updating deadline:', error);
      toast.error('Failed to update deadline');
    }
  }, [user]);

  // Update priority
  const updatePriority = useCallback(async (id: string, priority: number | undefined) => {
    if (!user) return;

    try {

      await supabase
        .from('timers')
        .update({
          priority: priority || null
        })
        .eq('id', id);

      setTimers(prev => prev.map(t => 
        t.id === id 
          ? { ...t, priority }
          : t
      ));

      toast.success('Priority updated');
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Failed to update priority');
    }
  }, [user]);

  // Reorder timers
  const reorderTimers = useCallback(async (reorderedTimers: Timer[]) => {
    setTimers(reorderedTimers);
  }, []);

  // Simple interval for display updates only
  useEffect(() => {
    const hasRunningTimers = timers.some(t => t.isRunning);
    
    if (hasRunningTimers) {
      intervalRef.current = setInterval(() => {
        // Force re-render for display updates
        setTimers(prev => [...prev]);
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
  }, [timers.some(t => t.isRunning)]);

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
    deleteTimer,
    renameTimer,
    updateDeadline,
    updatePriority,
    reorderTimers,
    getDisplayTime,
    // Animation state
    confettiTrigger,
    celebrationTrigger,
    clearConfettiTrigger,
    clearCelebrationTrigger,
  };
};