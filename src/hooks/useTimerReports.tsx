import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TimerReportData } from '../types/index';

interface DbTimerRecord {
  id: string;
  name: string;
  elapsed_time: number;
  is_running: boolean;
  created_at: string;
  deleted_at?: string;
  deleted_by?: string;
  category?: string;
  tags?: string[];
  deadline?: string;
  priority?: number;
}

export const useTimerReports = () => {
  const [reportData, setReportData] = useState<TimerReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const sessionStartTimesRef = useRef<Map<string, Date>>(new Map());
  const { user } = useAuth();
  const { toast } = useToast();

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const loadAllTimerData = useCallback(async () => {
    if (!user) {
      setReportData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 useTimerReports - Starting data fetch for user:', user.id);
      
      // Fetch ALL timers including deleted ones for comprehensive reports
      const { data: timersData, error: timersError } = await supabase
        .from('timers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (timersError) {
        console.error("❌ useTimerReports - Error loading timer data:", timersError);
        toast({
          title: "Error",
          description: "Failed to load timer data",
          variant: "destructive",
        });
        setReportData([]);
        return;
      }

      console.log(`✅ useTimerReports - Loaded ${timersData?.length || 0} timers`);

      if (!timersData || timersData.length === 0) {
        console.log('ℹ️ useTimerReports - No timer data found');
        setReportData([]);
        return;
      }

      // Get session data for running timers
      const runningTimerIds = timersData
        .filter(timer => timer.is_running && !timer.deleted_at)
        .map(timer => timer.id);

      const newSessionStartTimes = new Map<string, Date>();

      if (runningTimerIds.length > 0) {
        console.log(`🔍 useTimerReports - Fetching sessions for ${runningTimerIds.length} running timers`);
        
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('timer_sessions')
          .select('timer_id, start_time')
          .in('timer_id', runningTimerIds)
          .is('end_time', null)
          .eq('user_id', user.id);

        if (sessionsError) {
          console.error("❌ useTimerReports - Error loading session data:", sessionsError);
        } else if (sessionsData) {
          sessionsData.forEach(session => {
            newSessionStartTimes.set(session.timer_id, new Date(session.start_time));
          });
          console.log(`✅ useTimerReports - Loaded ${sessionsData.length} active sessions`);
        }
      }

      // Update session start times ref
      sessionStartTimesRef.current = newSessionStartTimes;

      // Transform data for reports with inline time calculation
      const transformedData: TimerReportData[] = timersData.map((timer: DbTimerRecord) => {
        let status: 'Running' | 'Stopped' | 'Deleted' = 'Stopped';
        
        if (timer.deleted_at) {
          status = 'Deleted';
        } else if (timer.is_running) {
          status = 'Running';
        }

        // Calculate total time including current session for running timers
        let totalMs = timer.elapsed_time;
        if (timer.is_running && !timer.deleted_at) {
          const sessionStart = newSessionStartTimes.get(timer.id);
          if (sessionStart) {
            const currentSessionMs = Date.now() - sessionStart.getTime();
            totalMs += currentSessionMs;
          }
        }

        const reportItem: TimerReportData = {
          id: timer.id,
          name: timer.name,
          category: timer.category || 'Uncategorized',
          totalTime: formatTime(totalMs),
          totalTimeMs: totalMs,
          status,
          createdDate: new Date(timer.created_at).toLocaleString(),
          deletedDate: timer.deleted_at ? new Date(timer.deleted_at).toLocaleString() : undefined,
          priority: timer.priority ? `Priority ${timer.priority}` : 'No Priority',
          deadlineDate: timer.deadline ? new Date(timer.deadline).toLocaleString() : 'No Deadline',
          tags: timer.tags && timer.tags.length > 0 ? timer.tags.join(', ') : 'No Tags',
          baseElapsedTime: timer.elapsed_time, // Store the database elapsed time
        };

        return reportItem;
      });

      console.log(`✅ useTimerReports - Transformed ${transformedData.length} timer records`);
      setReportData(transformedData);
    } catch (error) {
      console.error("❌ useTimerReports - Unexpected error:", error);
      toast({
        title: "Error",
        description: "Failed to load timer data",
        variant: "destructive",
      });
      setReportData([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Update report data for running timers in real-time
  const updateRunningTimers = useCallback(() => {
    setReportData(prevData => 
      prevData.map(timer => {
        if (timer.status === 'Running' && timer.baseElapsedTime !== undefined) {
          const sessionStart = sessionStartTimesRef.current.get(timer.id);
          if (sessionStart) {
            // Calculate current session time and add to base elapsed time
            const currentSessionMs = Date.now() - sessionStart.getTime();
            const newTotalMs = timer.baseElapsedTime + currentSessionMs;
            
            return {
              ...timer,
              totalTime: formatTime(newTotalMs),
              totalTimeMs: newTotalMs
            };
          }
        }
        return timer;
      })
    );
  }, []);

  // Initial data load
  useEffect(() => {
    loadAllTimerData();
  }, [loadAllTimerData]);

  // Real-time updates for running timers
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionStartTimesRef.current.size > 0) {
        updateRunningTimers();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [updateRunningTimers]);

  return {
    reportData,
    loading,
    formatTime,
  };
};