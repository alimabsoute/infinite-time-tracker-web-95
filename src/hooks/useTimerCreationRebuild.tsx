
import { useCallback } from 'react';
import { Timer } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { toast } from 'sonner';

interface UseTimerCreationProps {
  timers: Timer[];
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
  calculateSessionElapsedTime: (timer: Timer) => number;
  reloadTimers: () => Promise<void>;
}

export const useTimerCreationRebuild = ({ 
  timers, 
  setTimers, 
  calculateSessionElapsedTime,
  reloadTimers 
}: UseTimerCreationProps) => {
  const { user } = useAuth();
  const { canCreateTimer, canStartTimer, getTimerLimit, getRunningTimerLimit } = useSubscription();

  const addTimer = useCallback(async (name: string, category?: string): Promise<string> => {
    if (!user) {
      toast.error('You must be logged in to create timers');
      return '';
    }

    // Check limits
    if (!canCreateTimer(timers.length)) {
      const limit = getTimerLimit();
      toast.error('Timer limit reached', {
        description: `Free plan allows up to ${limit} timers. Upgrade to create unlimited timers.`
      });
      return '';
    }

    const runningTimers = timers.filter(t => t.isRunning);
    if (!canStartTimer(runningTimers.length)) {
      const runningLimit = getRunningTimerLimit();
      toast.error('Running timer limit reached', {
        description: `Free plan allows up to ${runningLimit} running timers.`
      });
      return '';
    }

    try {
      // Generate unique name if needed
      let finalName = name;
      if (!name || name.trim() === '' || name === 'New Timer') {
        try {
          const { data: uniqueName, error: nameError } = await (supabase as any)
            .rpc('generate_unique_timer_name', { p_user_id: user.id });
          
          if (nameError) {
            console.warn('Database function failed, using fallback:', nameError);
            const existingNames = timers.map(t => t.name);
            let counter = 1;
            let testName = `Timer ${counter}`;
            while (existingNames.includes(testName)) {
              counter++;
              testName = `Timer ${counter}`;
            }
            finalName = testName;
          } else {
            finalName = uniqueName || 'Timer 1';
          }
        } catch (error) {
          console.warn('RPC call failed, using fallback:', error);
          const existingNames = timers.map(t => t.name);
          let counter = 1;
          let testName = `Timer ${counter}`;
          while (existingNames.includes(testName)) {
            counter++;
            testName = `Timer ${counter}`;
          }
          finalName = testName;
        }
      }

      const now = new Date();
      const newTimerId = crypto.randomUUID();

      // Stop all currently running timers first
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

      // Create new timer in database
      const { error: insertError } = await supabase
        .from('timers')
        .insert({
          id: newTimerId,
          name: finalName,
          elapsed_time: 0,
          is_running: true, // Start immediately
          created_at: now.toISOString(),
          category,
          user_id: user.id
        });

      if (insertError) {
        console.error('❌ Error creating timer:', insertError);
        toast.error('Failed to create timer');
        return '';
      }

      // Create session for new timer
      const sessionId = crypto.randomUUID();
      await supabase
        .from('timer_sessions')
        .insert({
          id: sessionId,
          timer_id: newTimerId,
          start_time: now.toISOString(),
          user_id: user.id
        });

      // Create new timer object
      const newTimer: Timer = {
        id: newTimerId,
        name: finalName,
        elapsedTime: 0,
        isRunning: true,
        createdAt: now,
        category,
        currentSessionId: sessionId,
        sessionStartTime: now
      };

      // Update local state - add new timer and stop all others
      setTimers(prev => [
        newTimer,
        ...prev.map(t => ({
          ...t,
          isRunning: false,
          elapsedTime: calculateSessionElapsedTime(t),
          currentSessionId: undefined,
          sessionStartTime: undefined
        }))
      ]);

      toast.success('Timer created and started!', {
        description: `"${finalName}" is now running`
      });

      return newTimerId;
    } catch (error) {
      console.error('❌ Error creating timer:', error);
      toast.error('Failed to create timer');
      reloadTimers();
      return '';
    }
  }, [user, timers, setTimers, calculateSessionElapsedTime, canCreateTimer, canStartTimer, getTimerLimit, getRunningTimerLimit, reloadTimers]);

  return {
    addTimer
  };
};
