
import { useCallback, useRef } from 'react';
import { Timer, TimerSession } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export const useSessionManager = () => {
  const { user } = useAuth();
  const activeSessionsRef = useRef<Map<string, string>>(new Map());

  const createSession = useCallback(async (timerId: string, startTime: Date): Promise<string | null> => {
    if (!user) return null;

    try {
      const sessionId = crypto.randomUUID();
      const sessionData = {
        id: sessionId,
        timer_id: timerId,
        start_time: startTime.toISOString(),
        user_id: user.id
      };

      const { error } = await supabase
        .from('timer_sessions')
        .insert(sessionData);
      
      if (error) {
        console.error("❌ Failed to create session:", error);
        return null;
      }

      activeSessionsRef.current.set(timerId, sessionId);
      console.log(`✅ Created session ${sessionId} for timer ${timerId}`);
      return sessionId;
    } catch (error) {
      console.error("❌ Exception creating session:", error);
      return null;
    }
  }, [user]);

  const endSession = useCallback(async (timerId: string, sessionId: string, endTime: Date, duration: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('timer_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration_ms: duration,
        })
        .eq('id', sessionId);

      if (error) {
        console.error("❌ Failed to end session:", error);
        return false;
      }

      activeSessionsRef.current.delete(timerId);
      console.log(`✅ Ended session ${sessionId} for timer ${timerId}`);
      return true;
    } catch (error) {
      console.error("❌ Exception ending session:", error);
      return false;
    }
  }, []);

  const getActiveSession = useCallback((timerId: string): string | undefined => {
    return activeSessionsRef.current.get(timerId);
  }, []);

  const hasActiveSession = useCallback((timerId: string): boolean => {
    return activeSessionsRef.current.has(timerId);
  }, []);

  return {
    createSession,
    endSession,
    getActiveSession,
    hasActiveSession
  };
};
