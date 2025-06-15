
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "../contexts/AuthContext";
import { TimerSessionWithTimer } from "../types";
import { toast } from "sonner";

export const useTimerSessionsData = () => {
  const [sessions, setSessions] = useState<TimerSessionWithTimer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    const loadSessions = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
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

        if (error) {
          console.error("Error loading timer sessions:", error);
          toast.error("Failed to load timer sessions");
          setSessions([]);
          return;
        }

        setSessions(data || []);
      } catch (error) {
        console.error("Error loading timer sessions:", error);
        toast.error("Failed to load timer sessions");
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [user]);

  return {
    sessions,
    loading,
  };
};
