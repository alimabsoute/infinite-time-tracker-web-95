
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
  setCelebrationTrigger: React.Dispatch<React.SetStateAction<{ type: 'fireworks' | 'sparkles' | 'balloons' | 'animals' | null }>>;
  clearConfettiTrigger: () => void;
}

export const useTimerCreation = ({ 
  timers, 
  setTimers, 
  setConfettiTrigger, 
  setCelebrationTrigger,
  clearConfettiTrigger 
}: UseTimerCreationProps) => {
  const { user } = useAuth();
  const { canCreateTimer, canStartTimer, getTimerLimit, getRunningTimerLimit } = useSubscription();
  const { createSession, endSession } = useSessionManager();

  const addTimer = useCallback(async (name: string, category?: string): Promise<string> => {
    console.log('🚀 Starting enhanced addTimer function with name:', name);
    
    if (!user) {
      console.error("❌ No user found");
      toast.error("You must be logged in to create timers");
      return "";
    }

    // Check if user can create more timers
    if (!canCreateTimer(timers.length)) {
      const limit = getTimerLimit();
      console.error("❌ Timer limit reached:", limit);
      toast.error("Timer limit reached", {
        description: `Free plan allows up to ${limit} timers. Upgrade to create unlimited timers.`
      });
      return "";
    }

    // Check running timer limit
    const runningTimers = timers.filter(t => t.isRunning);
    if (!canStartTimer(runningTimers.length)) {
      const runningLimit = getRunningTimerLimit();
      console.error("❌ Running timer limit reached:", runningLimit);
      toast.error("Running timer limit reached", {
        description: `Free plan allows up to ${runningLimit} running timers. Upgrade for unlimited running timers.`
      });
      return "";
    }

    try {
      const now = new Date();
      const newTimer: Timer = {
        id: crypto.randomUUID(),
        name,
        elapsedTime: 0,
        isRunning: false,
        createdAt: now,
        category,
      };
      
      console.log('➕ Adding new timer:', newTimer.name, 'with ID:', newTimer.id);
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
      
      // Insert the timer into the database
      console.log('💾 Inserting timer into database...');
      const { error: insertError } = await supabase
        .from('timers')
        .insert({
          id: newTimer.id,
          name: newTimer.name,
          elapsed_time: newTimer.elapsedTime,
          is_running: false,
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

      // Create a session and start the timer
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
      } else {
        console.log('✅ Timer updated to running state');
      }

      // Set the timer properties for local state
      newTimer.isRunning = true;
      newTimer.currentSessionId = sessionId;
      newTimer.sessionStartTime = now;

      console.log('🔄 Updating local state...');
      // Add new timer and pause others
      setTimers((prev) => [
        newTimer,
        ...prev.map(timer => ({ 
          ...timer, 
          isRunning: false, 
          currentSessionId: undefined, 
          sessionStartTime: undefined 
        }))
      ]);
      
      console.log('🎊 Triggering enhanced celebration animations...');
      clearConfettiTrigger();
      
      // Trigger enhanced confetti animation at center of screen
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setConfettiTrigger({ x: centerX, y: centerY, id: newTimer.id });
      
      // Enhanced celebration variety - randomly choose from all 4 types
      const celebrationTypes: Array<'fireworks' | 'sparkles' | 'balloons' | 'animals'> = 
        ['fireworks', 'sparkles', 'balloons', 'animals'];
      const randomCelebration = celebrationTypes[Math.floor(Math.random() * celebrationTypes.length)];
      
      console.log('🎭 Selected celebration type:', randomCelebration);
      setCelebrationTrigger({ type: randomCelebration });
      
      // Enhanced success messages based on celebration type
      const celebrationMessages = {
        fireworks: "Timer created with a spectacular fireworks display! 🎆",
        sparkles: "Timer created with magical sparkles! ✨",
        balloons: "Timer created with floating balloons! 🎈",
        animals: "Timer created with dancing stuffed animals! 🧸"
      };
      
      if (runningTimers.length > 0) {
        toast.success(celebrationMessages[randomCelebration], {
          description: `${runningTimers.length} other timer${runningTimers.length > 1 ? 's' : ''} paused automatically`
        });
      } else {
        toast.success(celebrationMessages[randomCelebration]);
      }
      
      console.log('✅ Enhanced timer creation completed successfully with ID:', newTimer.id);
      return newTimer.id;
    } catch (error) {
      console.error("❌ Unexpected error in addTimer:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      toast.error("Failed to create timer");
      return "";
    }
  }, [user, timers, clearConfettiTrigger, canCreateTimer, canStartTimer, getTimerLimit, getRunningTimerLimit, setTimers, setConfettiTrigger, setCelebrationTrigger, createSession, endSession]);

  return {
    addTimer
  };
};
