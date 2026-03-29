
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TimerSessionWithTimer } from '../types/index';

export const useTimerSessions = () => {
  const [sessions, setSessions] = useState<TimerSessionWithTimer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSessions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    
    try {
      setLoading(true);
      setError(null);

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000);
      });
      
      // Create fetch promises with timeout
      const fetchSessionsPromise = supabase
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

      const fetchRunningTimersPromise = supabase
        .from('timers')
        .select('id, name, category, elapsed_time, created_at, start_time')
        .eq('user_id', user.id)
        .eq('is_running', true);


      // Execute both queries with timeout
      const [sessionsResult, runningTimersResult] = await Promise.race([
        Promise.all([fetchSessionsPromise, fetchRunningTimersPromise]),
        timeoutPromise
      ]) as [any, any];

      const { data: sessionData, error: sessionError } = sessionsResult;
      const { data: runningTimers, error: timersError } = runningTimersResult;

      if (sessionError) {
        console.error('useTimerSessions - Session query error:', sessionError);
        throw sessionError;
      }
      if (timersError) {
        console.error('useTimerSessions - Running timers query error:', timersError);
        throw timersError;
      }

      let processedSessions: TimerSessionWithTimer[] = sessionData || [];

      // Create virtual sessions for running timers with real-time duration
      if (runningTimers && runningTimers.length > 0) {
        const virtualSessions: TimerSessionWithTimer[] = runningTimers.map(timer => {
          const now = new Date();
          // Use timer's start_time if available, fallback to created_at
          const timerStartTime = timer.start_time ? new Date(timer.start_time) : new Date(timer.created_at || now);
          
          // Calculate real-time duration: base elapsed_time + time since last start
          const baseElapsedTime = timer.elapsed_time || 0;
          const timeSinceStart = now.getTime() - timerStartTime.getTime();
          const realTimeDuration = Math.max(baseElapsedTime + timeSinceStart, timeSinceStart);

          return {
            id: `virtual-${timer.id}`, // Unique ID for virtual session
            timer_id: timer.id,
            user_id: user.id,
            start_time: timerStartTime.toISOString(),
            end_time: null, // Running timer has no end time
            duration_ms: realTimeDuration, // Use calculated real-time duration
            created_at: timerStartTime.toISOString(),
            timers: {
              id: timer.id,
              name: timer.name,
              category: timer.category || 'Uncategorized'
            }
          } as TimerSessionWithTimer;
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
        }

        return {
          ...session,
          duration_ms: calculatedDuration,
          created_at: session.created_at || session.start_time // Ensure created_at is present
        };
      });

      setSessions(finalSessions);
    } catch (error) {
      console.error('useTimerSessions - Error fetching sessions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      
      // Don't show toast for timeout errors, just log them
      if (!errorMessage.includes('timeout')) {
        toast({
          title: "Error",
          description: "Failed to fetch timer sessions",
          variant: "destructive",
        });
      }
      
      // Set empty sessions array so dashboard can still load
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    // Set a maximum loading time of 15 seconds
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Loading timeout - dashboard will show with limited data');
      }
    }, 15000);

    fetchSessions().finally(() => {
      clearTimeout(loadingTimeout);
    });

    // Set up real-time updates for running timers every 5 seconds
    const interval = setInterval(() => {
      setSessions(currentSessions => {
        if (currentSessions.some(session => session.id.startsWith('virtual-'))) {
          return currentSessions.map(session => {
            if (session.id.startsWith('virtual-')) {
              const now = new Date();
              const startTime = new Date(session.start_time);
              const newDuration = now.getTime() - startTime.getTime();
              return {
                ...session,
                duration_ms: Math.max(newDuration, 0)
              };
            }
            return session;
          });
        }
        return currentSessions;
      });
    }, 5000);

    return () => {
      clearTimeout(loadingTimeout);
      clearInterval(interval);
    };
  }, [user]);

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
  };
};
