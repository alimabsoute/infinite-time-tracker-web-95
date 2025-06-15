
import { useCallback } from 'react';
import { Timer, TimerSession } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const useTimerSessions = () => {
  const { user } = useAuth();

  const createSession = useCallback(async (timerId: string, startTime: Date, sessionId?: string): Promise<string | null> => {
    if (!user) return null;

    try {
      const newSessionId = sessionId || crypto.randomUUID();
      const newSession: Omit<TimerSession, 'id'> & { id: string } = {
        id: newSessionId,
        timer_id: timerId,
        start_time: startTime.toISOString(),
        user_id: user.id
      };

      const { error } = await (supabase.from('timer_sessions') as any).insert(newSession);
      
      if (error) {
        console.error("Error creating session:", error);
        return null;
      }

      return newSessionId;
    } catch (error) {
      console.error("Error creating session:", error);
      return null;
    }
  }, [user]);

  const endSession = useCallback(async (sessionId: string, endTime: Date, duration: number): Promise<boolean> => {
    try {
      const { error } = await (supabase.from('timer_sessions') as any).update({
        end_time: endTime.toISOString(),
        duration_ms: duration,
      }).eq('id', sessionId);

      if (error) {
        console.error("Error ending session:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error ending session:", error);
      return false;
    }
  }, []);

  const endMultipleSessions = useCallback(async (timers: Timer[], endTime: Date): Promise<void> => {
    const updates = timers
      .filter(timer => timer.currentSessionId && timer.sessionStartTime)
      .map(timer => {
        const duration = endTime.getTime() - timer.sessionStartTime!.getTime();
        return Promise.all([
          endSession(timer.currentSessionId!, endTime, duration),
          supabase.from('timers').update({
            is_running: false,
            elapsed_time: timer.elapsedTime + duration,
          }).eq('id', timer.id)
        ]);
      });

    try {
      await Promise.all(updates);
    } catch (error) {
      console.error("Error ending multiple sessions:", error);
    }
  }, [endSession]);

  return {
    createSession,
    endSession,
    endMultipleSessions
  };
};
