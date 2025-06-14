
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export interface TimerReportData {
  id: string;
  name: string;
  category: string;
  totalTime: string;
  totalTimeMs: number;
  status: 'Running' | 'Stopped' | 'Deleted';
  createdDate: string;
  deletedDate?: string;
  deletedBy?: string;
  priority: string;
  deadlineDate: string;
  tags: string;
}

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
        
        // Fetch ALL timers including deleted ones for reports
        const { data, error } = await supabase
          .from('timers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error loading timer report data:", error);
          toast.error("Failed to load timer data");
          setReportData([]);
          return;
        }

        // Transform data for reports
        const transformedData: TimerReportData[] = data.map((timer: DbTimerRecord) => {
          let status: 'Running' | 'Stopped' | 'Deleted' = 'Stopped';
          
          if (timer.deleted_at) {
            status = 'Deleted';
          } else if (timer.is_running) {
            status = 'Running';
          }

          return {
            id: timer.id,
            name: timer.name,
            category: timer.category || 'Uncategorized',
            totalTime: formatTime(timer.elapsed_time),
            totalTimeMs: timer.elapsed_time,
            status,
            createdDate: new Date(timer.created_at).toLocaleString(),
            deletedDate: timer.deleted_at ? new Date(timer.deleted_at).toLocaleString() : undefined,
            deletedBy: timer.deleted_by || undefined,
            priority: timer.priority ? `Priority ${timer.priority}` : 'No Priority',
            deadlineDate: timer.deadline ? new Date(timer.deadline).toLocaleString() : 'No Deadline',
            tags: timer.tags ? timer.tags.join(', ') : 'No Tags',
          };
        });

        setReportData(transformedData);
      } catch (error) {
        console.error("Error loading timer report data:", error);
        toast.error("Failed to load timer data");
      } finally {
        setLoading(false);
      }
    };

    loadAllTimerData();
  }, [user]);

  return {
    reportData,
    loading,
    formatTime,
  };
};
