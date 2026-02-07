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
  start_time?: string; // Add start_time field for running timers
}

export const useTimerReports = () => {
  const [reportData, setReportData] = useState<TimerReportData[]>([]);
  const [loading, setLoading] = useState(true);
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
      // Fetch ALL timers including deleted ones for comprehensive reports
      const { data: timersData, error: timersError } = await supabase
        .from('timers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (timersError) {
        console.error("Error loading timer data:", timersError);
        toast({
          title: "Error",
          description: "Failed to load timer data",
          variant: "destructive",
        });
        setReportData([]);
        return;
      }

      if (!timersData || timersData.length === 0) {
        setReportData([]);
        return;
      }

      // Transform data for reports - Total Time = time since creation
      const transformedData: TimerReportData[] = timersData.map((timer: DbTimerRecord) => {
        let status: 'Running' | 'Stopped' | 'Deleted' = 'Stopped';
        
        if (timer.deleted_at) {
          status = 'Deleted';
        } else if (timer.is_running) {
          status = 'Running';
        }

        // Calculate total time since creation
        const createdTime = new Date(timer.created_at).getTime();
        const endTime = timer.deleted_at 
          ? new Date(timer.deleted_at).getTime()
          : Date.now();
        const totalMs = endTime - createdTime;

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
        };

        return reportItem;
      });

      setReportData(transformedData);
    } catch (error) {
      console.error("Unexpected error loading timer data:", error);
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

  // Update running timers in real-time (simple calculation from creation time)
  const updateRunningTimers = useCallback(() => {
    setReportData(prevData => 
      prevData.map(timer => {
        if (timer.status === 'Running') {
          // Recalculate time since creation for running timers
          const createdTime = new Date(timer.createdDate).getTime();
          const totalMs = Date.now() - createdTime;
          
          return {
            ...timer,
            totalTime: formatTime(totalMs),
            totalTimeMs: totalMs
          };
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
    const hasRunningTimers = reportData.some(timer => timer.status === 'Running');
    
    if (!hasRunningTimers) return;

    const interval = setInterval(() => {
      updateRunningTimers();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateRunningTimers, reportData]);

  return {
    reportData,
    loading,
    formatTime,
  };
};