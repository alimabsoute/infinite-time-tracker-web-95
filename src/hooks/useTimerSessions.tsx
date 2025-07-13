
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TimerSessionWithTimer } from '../types/index';

export const useTimerSessions = () => {
  const [sessions, setSessions] = useState<TimerSessionWithTimer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSessions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch timer sessions with timer data
      const { data: sessionData, error: sessionError } = await supabase
        .from('timer_sessions')
        .select(`
          *,
          timers (
            id,
            name,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (sessionError) throw sessionError;

      // Fetch running timers to calculate their current duration
      const { data: runningTimers, error: timersError } = await supabase
        .from('timers')
        .select('id, name, category, elapsed_time, created_at')
        .eq('user_id', user.id)
        .eq('is_running', true);

      if (timersError) throw timersError;

      console.log('🔍 useTimerSessions - Raw data:', {
        sessionsCount: sessionData?.length || 0,
        runningTimersCount: runningTimers?.length || 0,
        sampleSession: sessionData?.[0] ? {
          id: sessionData[0].id,
          timer_id: sessionData[0].timer_id,
          duration_ms: sessionData[0].duration_ms,
          start_time: sessionData[0].start_time,
          end_time: sessionData[0].end_time,
          timer_name: sessionData[0].timers?.name
        } : null,
        sampleRunningTimer: runningTimers?.[0] ? {
          id: runningTimers[0].id,
          name: runningTimers[0].name,
          elapsed_time: runningTimers[0].elapsed_time
        } : null
      });

      let processedSessions: TimerSessionWithTimer[] = sessionData || [];

      // Create virtual sessions for running timers
      if (runningTimers && runningTimers.length > 0) {
        const virtualSessions: TimerSessionWithTimer[] = runningTimers.map(timer => {
          const now = new Date();
          const startTime = new Date(timer.created_at || now);
          const currentDuration = timer.elapsed_time || 0; // This is already in milliseconds
          
          console.log('🔍 useTimerSessions - Creating virtual session for running timer:', {
            timerId: timer.id,
            timerName: timer.name,
            elapsedTime: currentDuration,
            startTime: startTime.toISOString()
          });

          return {
            id: `virtual-${timer.id}`, // Unique ID for virtual session
            timer_id: timer.id,
            user_id: user.id,
            start_time: startTime.toISOString(),
            end_time: null, // Running timer has no end time
            duration_ms: currentDuration, // Use elapsed time as current duration
            created_at: startTime.toISOString(), // Add required created_at field
            timers: {
              id: timer.id,
              name: timer.name,
              category: timer.category || 'Uncategorized'
            }
          } as TimerSessionWithTimer;
        });

        console.log('🔍 useTimerSessions - Created virtual sessions:', {
          count: virtualSessions.length,
          samples: virtualSessions.slice(0, 2).map(vs => ({
            id: vs.id,
            timer_id: vs.timer_id,
            duration_ms: vs.duration_ms,
            timer_name: vs.timers?.name
          }))
        });

        // Add virtual sessions to the beginning of the array
        processedSessions = [...virtualSessions, ...processedSessions];
      }

      // Process all sessions to ensure proper duration calculation and add missing fields
      const finalSessions: TimerSessionWithTimer[] = processedSessions.map(session => {
        let calculatedDuration = session.duration_ms;

        // If duration_ms is null/undefined, try to calculate from start/end times
        if (!calculatedDuration && session.start_time && session.end_time) {
          const startTime = new Date(session.start_time);
          const endTime = new Date(session.end_time);
          calculatedDuration = endTime.getTime() - startTime.getTime();
          
          console.log('🔍 useTimerSessions - Calculated duration from timestamps:', {
            sessionId: session.id,
            startTime: session.start_time,
            endTime: session.end_time,
            calculatedDuration
          });
        }

        return {
          ...session,
          duration_ms: calculatedDuration,
          created_at: session.created_at || session.start_time // Ensure created_at is present
        };
      });

      console.log('🔍 useTimerSessions - Final processed sessions:', {
        totalCount: finalSessions.length,
        withDuration: finalSessions.filter(s => s.duration_ms && s.duration_ms > 0).length,
        withoutDuration: finalSessions.filter(s => !s.duration_ms || s.duration_ms <= 0).length,
        sampleProcessed: finalSessions.slice(0, 3).map(s => ({
          id: s.id,
          timer_id: s.timer_id,
          duration_ms: s.duration_ms,
          timer_name: s.timers?.name,
          isVirtual: s.id.startsWith('virtual-')
        }))
      });

      setSessions(finalSessions);
    } catch (error) {
      console.error('🔍 useTimerSessions - Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch timer sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  return {
    sessions,
    loading,
    refetch: fetchSessions,
  };
};
