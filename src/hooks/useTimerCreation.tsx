
import { useCallback } from 'react';
import { Timer } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useSessionManager } from './useSessionManager';
import { toast } from 'sonner';

interface UseTimerCreationProps {
  timers: Timer[];
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
  setConfettiTrigger: React.Dispatch<React.SetStateAction<{ x: number; y: number; id: string } | null>>;
  clearConfettiTrigger: () => void;
}

export const useTimerCreation = ({ 
  timers, 
  setTimers, 
  setConfettiTrigger, 
  clearConfettiTrigger 
}: UseTimerCreationProps) => {
  const { user } = useAuth();
  const { canCreateTimer, getTimerLimit } = useSubscription();
  const { createSession, endSession } = useSessionManager();

  const addTimer = useCallback(async (name: string, category?: string): Promise<string> => {
    console.log('🚀 Starting addTimer function with name:', name);
    
    if (!user) {
      console.error("❌ No user found");
      toast.error("You must be logged in to create timers");
      return "";
    }

    if (!canCreateTimer(timers.length)) {
      const limit = getTimerLimit();
      console.error("❌ Timer limit reached:", limit);
      toast.error("Timer limit reached", {
        description: `Free plan allows up to ${limit} timers. Upgrade to create unlimited timers.`
      });
      return "";
    }

    try {
      const now = new Date();
      const newTimer: Timer = {
        id: crypto.randomUUID(),
        name,
        elapsedTime: 0,
        isRunning: false, // Start as false, will be set to true after successful creation
        createdAt: now,
        category,
      };
      
      console.log('➕ Adding new timer:', newTimer.name, 'with ID:', newTimer.id);
      
      const runningTimers = timers.filter(t => t.isRunning);
      console.log('⏸️ Found', runningTimers.length, 'running timers to pause');
      
      // End all running sessions first
      const endPromises = runningTimers
        .filter(t => t.currentSessionId && t.sessionStartTime)
        .map(async (timer) => {
          try {
            console.log('⏹️ Ending session for timer:', timer.id);
            const duration = now.getTime() - timer.sessionStartTime!.getTime();
            await endSession(timer.id, timer.currentSessionId!, now, duration);
            return supabase.from('timers').update({
              is_running: false,
              elapsed_time: timer.elapsedTime + duration,
            }).eq('id', timer.id);
          } catch (error) {
            console.error('❌ Error ending session for timer:', timer.id, error);
            throw error;
          }
        });
      
      console.log('⏳ Waiting for', endPromises.length, 'sessions to end...');
      await Promise.all(endPromises);
      console.log('✅ All sessions ended successfully');
      
      // First, insert the timer into the database
      console.log('💾 Inserting timer into database...');
      const { error: insertError } = await supabase
        .from('timers')
        .insert({
          id: newTimer.id,
          name: newTimer.name,
          elapsed_time: newTimer.elapsedTime,
          is_running: false, // Insert as false initially
          created_at: newTimer.createdAt.toISOString(),
          category: newTimer.category,
          user_id: user.id
        });
      
      if (insertError) {
        console.error("❌ Error inserting timer:", insertError);
        toast.error("Failed to create timer");
        return "";
      }
      console.log('✅ Timer inserted successfully');

      // Now that the timer exists in the database, create a session and start it
      console.log('🎯 Creating session for timer...');
      const sessionId = await createSession(newTimer.id, now);
      if (!sessionId) {
        console.error("❌ Failed to create session");
        toast.error("Failed to start timer session");
        return "";
      }
      console.log('✅ Session created with ID:', sessionId);

      // Update the timer to running state in the database
      console.log('▶️ Updating timer to running state...');
      const { error: updateError } = await supabase
        .from('timers')
        .update({ is_running: true })
        .eq('id', newTimer.id);

      if (updateError) {
        console.error("❌ Error updating timer to running:", updateError);
        // Timer was created but couldn't be started - still return success
      } else {
        console.log('✅ Timer updated to running state');
      }

      // Set the timer properties for local state
      newTimer.isRunning = true;
      newTimer.currentSessionId = sessionId;
      newTimer.sessionStartTime = now;

      console.log('🔄 Updating local state...');
      // Optimistic update - add new timer and pause others
      setTimers((prev) => [
        newTimer,
        ...prev.map(timer => ({ 
          ...timer, 
          isRunning: false, 
          currentSessionId: undefined, 
          sessionStartTime: undefined 
        }))
      ]);
      
      console.log('🎊 Triggering confetti...');
      clearConfettiTrigger();
      
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setConfettiTrigger({ x: centerX, y: centerY, id: newTimer.id });
      
      if (runningTimers.length > 0) {
        toast.success("Timer created and started", {
          description: `${runningTimers.length} other timer${runningTimers.length > 1 ? 's' : ''} paused automatically`
        });
      } else {
        toast.success("Timer created and started");
      }
      
      console.log('✅ Timer creation completed successfully with ID:', newTimer.id);
      return newTimer.id;
    } catch (error) {
      console.error("❌ Unexpected error in addTimer:", error);
      // Log the full error object
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      toast.error("Failed to create timer");
      return "";
    }
  }, [user, timers, clearConfettiTrigger, canCreateTimer, getTimerLimit, setTimers, setConfettiTrigger, createSession, endSession]);

  return {
    addTimer
  };
};
