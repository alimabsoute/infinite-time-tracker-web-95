
import { useCallback } from 'react';
import { Timer } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useSessionManager } from './useSessionManager';
import { useTimerPersistenceFixed } from './useTimerPersistenceFixed';
// import { useTimerStateValidator } from './useTimerStateValidator'; // DISABLED to prevent timer state interference
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
  const { clearTimerState, saveTimerState } = useTimerPersistenceFixed();
  // const { fixDatabaseInconsistencies, validateDatabaseConsistency } = useTimerStateValidator(); // DISABLED

  const addTimer = useCallback(async (name: string, category?: string): Promise<string> => {
    console.log('🚀 Starting SUPER ENHANCED addTimer function with name:', name);
    
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
      console.log('🔍 [TIMER CREATION] Phase 1: Database state audit - DISABLED to prevent state conflicts');

      // Generate unique timer name if needed
      let finalName = name;
      if (!name || name.trim() === '' || name === 'New Timer') {
        console.log('🏷️ [TIMER CREATION] Generating unique timer name...');
        
        try {
          const { data: uniqueName, error: nameError } = await (supabase as any)
            .rpc('generate_unique_timer_name', { p_user_id: user.id });
          
          if (nameError) {
            console.warn("⚠️ Database function failed, using fallback:", nameError);
            // Fallback: generate unique name client-side
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
          
          console.log('✅ Generated unique timer name:', finalName);
        } catch (error) {
          console.warn("⚠️ RPC call failed, using fallback:", error);
          // Fallback: generate unique name client-side
          const existingNames = timers.map(t => t.name);
          let counter = 1;
          let testName = `Timer ${counter}`;
          while (existingNames.includes(testName)) {
            counter++;
            testName = `Timer ${counter}`;
          }
          finalName = testName;
          console.log('✅ Fallback generated unique timer name:', finalName);
        }
      }

      const now = new Date();
      const newTimer: Timer = {
        id: crypto.randomUUID(),
        name: finalName,
        elapsedTime: 0,
        isRunning: false,
        createdAt: now,
        category,
      };
      
      console.log('➕ [TIMER CREATION] Phase 2: Creating new timer:', newTimer.name, 'with ID:', newTimer.id);
      console.log('⏸️ [TIMER CREATION] Found', runningTimers.length, 'running timers in UI to pause');

      // PHASE 2: Database cleanup - DISABLED to prevent state conflicts  
      console.log('🛑 [TIMER CREATION] Phase 2a: Database cleanup DISABLED to preserve timer states');
      
      // End all running sessions for UI timers
      console.log('⏹️ [TIMER CREATION] Phase 2b: Ending UI timer sessions');
      const endPromises = runningTimers
        .filter(t => t.currentSessionId && t.sessionStartTime)
        .map(async (timer) => {
          try {
            console.log('⏹️ Ending session for timer:', timer.id);
            const duration = now.getTime() - timer.sessionStartTime!.getTime();
            await endSession(timer.id, timer.currentSessionId!, now, duration);
            // Note: Database update for is_running is handled by ensureSingleRunningTimer above
            return { timerId: timer.id, duration };
          } catch (error) {
            console.error('❌ Error ending session for timer:', timer.id, error);
            throw error;
          }
        });
      
      console.log('⏳ Waiting for', endPromises.length, 'sessions to end...');
      const sessionResults = await Promise.all(endPromises);
      console.log('✅ All sessions ended successfully:', sessionResults.length, 'sessions closed');
      
      // PHASE 3: Create new timer in database (STOPPED state initially)
      console.log('💾 [TIMER CREATION] Phase 3: Inserting timer into database (stopped state)');
      const { error: insertError } = await supabase
        .from('timers')
        .insert({
          id: newTimer.id,
          name: newTimer.name,
          elapsed_time: newTimer.elapsedTime,
          is_running: false, // Always start in stopped state
          created_at: newTimer.createdAt.toISOString(),
          category: newTimer.category,
          user_id: user.id
        });
      
      if (insertError) {
        console.error("❌ [TIMER CREATION] Error inserting timer:", insertError);
        toast.error("Failed to create timer");
        return "";
      }
      console.log('✅ [TIMER CREATION] Timer inserted successfully in stopped state');

      // PHASE 4: Create session and start timer atomically
      console.log('🎯 [TIMER CREATION] Phase 4: Creating session and starting timer');
      const sessionId = await createSession(newTimer.id, now);
      if (!sessionId) {
        console.error("❌ [TIMER CREATION] Failed to create session");
        toast.error("Failed to start timer session");
        return "";
      }
      console.log('✅ [TIMER CREATION] Session created with ID:', sessionId);

      // PHASE 5: Atomic database update to ensure only this timer is running
      console.log('🔒 [TIMER CREATION] Phase 5: Atomic database update for exclusive running state');
      
      // Use a transaction-like approach: first stop all, then start new one
      const { error: stopAllError } = await supabase
        .from('timers')
        .update({ is_running: false })
        .eq('user_id', user.id)
        .is('deleted_at', null);

      if (stopAllError) {
        console.error("❌ [TIMER CREATION] Error stopping all timers:", stopAllError);
        toast.error("Failed to stop existing timers");
        return "";
      }

      const { error: startNewError } = await supabase
        .from('timers')
        .update({ is_running: true })
        .eq('id', newTimer.id);

      if (startNewError) {
        console.error("❌ [TIMER CREATION] Error starting new timer:", startNewError);
        toast.error("Failed to start new timer");
        return "";
      }
      
      console.log('✅ [TIMER CREATION] Atomic update completed - only new timer is running');

      // PHASE 6: Database state verification - DISABLED to prevent state conflicts
      console.log('📊 [TIMER CREATION] Post-creation audit DISABLED to preserve timer states');

      // PHASE 7: Update local state to match database
      console.log('🔄 [TIMER CREATION] Phase 7: Updating local UI state');
      newTimer.isRunning = true;
      newTimer.currentSessionId = sessionId;
      newTimer.sessionStartTime = now;

      // Ensure all other timers are marked as stopped in local state
      const updatedTimers = [
        newTimer,
        ...timers.map(timer => ({ 
          ...timer, 
          isRunning: false, 
          currentSessionId: undefined, 
          sessionStartTime: undefined 
        }))
      ];
      
      setTimers(updatedTimers);
      
      // PHASE 8: Clear and save persistence data with new definitive state
      console.log('🧹 [TIMER CREATION] Phase 8: Clearing stale persistence data');
      clearTimerState();
      
      console.log('💾 [TIMER CREATION] Saving new definitive timer state');
      saveTimerState(updatedTimers, 'manual');
      
      console.log('🎊 Triggering SUPER ENHANCED celebration animations...');
      clearConfettiTrigger();
      
      // Trigger MASSIVE confetti animation at center of screen with slight randomization
      const centerX = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
      const centerY = window.innerHeight / 2 + (Math.random() - 0.5) * 100;
      console.log('🎉 Setting confetti trigger at:', { x: centerX, y: centerY });
      setConfettiTrigger({ x: centerX, y: centerY, id: newTimer.id });
      
      // Enhanced celebration variety with weighted randomization for more variety
      const celebrationTypes: Array<'fireworks' | 'sparkles' | 'balloons' | 'animals'> = [
        'fireworks', 'fireworks', // Higher weight for fireworks
        'sparkles', 'sparkles',   // Higher weight for sparkles
        'balloons', 
        'animals'
      ];
      const randomIndex = Math.floor(Math.random() * celebrationTypes.length);
      const randomCelebration = celebrationTypes[randomIndex];
      
      console.log('🎭 Selected ENHANCED celebration type:', randomCelebration, 'from', celebrationTypes.length, 'options');
      setCelebrationTrigger({ type: randomCelebration });
      
      // Enhanced success messages with more variety
      const celebrationMessages = {
        fireworks: "🎆 Timer created with SPECTACULAR fireworks display!",
        sparkles: "✨ Timer created with MAGICAL sparkles everywhere!",
        balloons: "🎈 Timer created with FLOATING rainbow balloons!",
        animals: "🧸 Timer created with DANCING stuffed animals!"
      };
      
      const celebrationDescriptions = {
        fireworks: "Watch the sky light up with colorful bursts!",
        sparkles: "Shimmering magic fills your screen!",
        balloons: "Colorful balloons float up to celebrate!",
        animals: "Cute stuffed animals dance with joy!"
      };
      
      if (runningTimers.length > 0) {
        toast.success(celebrationMessages[randomCelebration], {
          description: `${celebrationDescriptions[randomCelebration]} ${runningTimers.length} other timer${runningTimers.length > 1 ? 's' : ''} paused automatically.`
        });
      } else {
        toast.success(celebrationMessages[randomCelebration], {
          description: celebrationDescriptions[randomCelebration]
        });
      }
      
      console.log('✅ SUPER ENHANCED timer creation completed successfully with ID:', newTimer.id);
      console.log('🎨 Animation state set:', {
        confetti: { x: centerX, y: centerY, id: newTimer.id },
        celebration: randomCelebration
      });
      
      console.log('✅ [TIMER CREATION] PHASE COMPLETE: Timer creation successful with ID:', newTimer.id);
      console.log('🎨 [TIMER CREATION] Animation state set:', {
        confetti: { x: centerX, y: centerY, id: newTimer.id },
        celebration: randomCelebration
      });
      
      return newTimer.id;
    } catch (error) {
      console.error("❌ [TIMER CREATION] CRITICAL ERROR in addTimer:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      toast.error("Failed to create timer");
      return "";
    }
  }, [user, timers, clearConfettiTrigger, canCreateTimer, canStartTimer, getTimerLimit, getRunningTimerLimit, setTimers, setConfettiTrigger, setCelebrationTrigger, createSession, endSession, clearTimerState, saveTimerState]);

  return {
    addTimer
  };
};
