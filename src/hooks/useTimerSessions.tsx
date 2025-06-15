
import { useCallback } from 'react';
import { Timer, TimerSession } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useSessionManager } from './useSessionManager';

export const useTimerSessions = () => {
  const { user } = useAuth();
  const { createSession: createSessionRecord, endSession: endSessionRecord } = useSessionManager();

  const createSession = useCallback(async (timerId: string, startTime: Date, sessionId?: string): Promise<string | null> => {
    if (!user) return null;
    return createSessionRecord(timerId, startTime);
  }, [user, createSessionRecord]);

  const endSession = useCallback(async (sessionId: string, endTime: Date, duration: number, timerId?: string): Promise<boolean> => {
    if (!timerId) {
      console.error("❌ Timer ID required to end session");
      return false;
    }
    return endSessionRecord(timerId, sessionId, endTime, duration);
  }, [endSessionRecord]);

  const endMultipleSessions = useCallback(async (timers: Timer[], endTime: Date): Promise<void> => {
    const sessionPromises = timers
      .filter(timer => timer.currentSessionId && timer.sessionStartTime)
      .map(async (timer) => {
        const duration = endTime.getTime() - timer.sessionStartTime!.getTime();
        
        // End the session
        const sessionEnded = await endSessionRecord(timer.id, timer.currentSessionId!, endTime, duration);
        
        // Update timer in database
        if (sessionEnded) {
          await supabase.from('timers').update({
            is_running: false,
            elapsed_time: timer.elapsedTime + duration,
          }).eq('id', timer.id);
        }
        
        return sessionEnded;
      });

    try {
      const results = await Promise.allSettled(sessionPromises);
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value === true
      ).length;
      
      console.log(`✅ Ended ${successful}/${timers.length} sessions successfully`);
    } catch (error) {
      console.error("❌ Error ending multiple sessions:", error);
    }
  }, [endSessionRecord]);

  return {
    createSession,
    endSession,
    endMultipleSessions
  };
};
