import { useState, useEffect } from 'react';
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
  const { user } = useAuth();
  const { toast } = useToast();

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!user) {
      setReportData([]);
      setLoading(false);
      return;
    }

    const loadAllTimerData = async () => {
      try {
        setLoading(true);
        console.log('🔍 useTimerReports - Starting data fetch for user:', user.id);
        
        // Fetch ALL timers including deleted ones for comprehensive reports
        const { data, error } = await supabase
          .from('timers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("❌ useTimerReports - Error loading timer data:", error);
          toast({
            title: "Error",
            description: "Failed to load timer data",
            variant: "destructive",
          });
          setReportData([]);
          return;
        }

        console.log(`✅ useTimerReports - Loaded ${data?.length || 0} timers`);

        if (!data || data.length === 0) {
          console.log('ℹ️ useTimerReports - No timer data found');
          setReportData([]);
          return;
        }

        // Transform data for reports with enhanced logging
        const transformedData: TimerReportData[] = data.map((timer: DbTimerRecord) => {
          let status: 'Running' | 'Stopped' | 'Deleted' = 'Stopped';
          
          if (timer.deleted_at) {
            status = 'Deleted';
          } else if (timer.is_running) {
            status = 'Running';
          }

          const reportItem: TimerReportData = {
            id: timer.id,
            name: timer.name,
            category: timer.category || 'Uncategorized',
            totalTime: formatTime(timer.elapsed_time),
            totalTimeMs: timer.elapsed_time,
            status,
            createdDate: new Date(timer.created_at).toLocaleString(),
            deletedDate: timer.deleted_at ? new Date(timer.deleted_at).toLocaleString() : undefined,
            priority: timer.priority ? `Priority ${timer.priority}` : 'No Priority',
            deadlineDate: timer.deadline ? new Date(timer.deadline).toLocaleString() : 'No Deadline',
            tags: timer.tags && timer.tags.length > 0 ? timer.tags.join(', ') : 'No Tags',
          };

          console.log('🔍 useTimerReports - Transformed timer:', {
            name: timer.name,
            category: reportItem.category,
            status: reportItem.status,
            totalTime: reportItem.totalTime
          });

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
    };

    loadAllTimerData();
  }, [user, toast]);

  return {
    reportData,
    loading,
    formatTime,
  };
};