
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "../contexts/AuthContext";
import { TimerSessionWithTimer } from "../types";
import { parseISO, isValid, format } from 'date-fns';

export const useTimerSessionsDebug = () => {
  const [sessions, setSessions] = useState<TimerSessionWithTimer[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    const loadAndDebugSessions = async () => {
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
          setSessions([]);
          setDebugInfo({ error: error.message });
          return;
        }

        const rawSessions = data || [];
        console.log('🔍 Raw sessions from database:', rawSessions.length);

        // Debug session data structure
        const debugData = {
          totalSessions: rawSessions.length,
          validSessions: 0,
          invalidSessions: 0,
          sessionsWithDuration: 0,
          sessionsByDate: {} as Record<string, number>,
          dateParsingErrors: [] as string[],
          sampleSessions: [] as any[]
        };

        const processedSessions: TimerSessionWithTimer[] = [];

        rawSessions.forEach((session, index) => {
          console.log(`🔍 Processing session ${index + 1}/${rawSessions.length}:`, {
            id: session.id,
            start_time: session.start_time,
            duration_ms: session.duration_ms,
            timer_name: session.timers?.name
          });

          // Validate start_time
          if (!session.start_time) {
            debugData.invalidSessions++;
            debugData.dateParsingErrors.push(`Session ${session.id}: missing start_time`);
            return;
          }

          try {
            const startDate = parseISO(session.start_time);
            if (!isValid(startDate)) {
              debugData.invalidSessions++;
              debugData.dateParsingErrors.push(`Session ${session.id}: invalid start_time ${session.start_time}`);
              return;
            }

            // Track by date
            const dateKey = format(startDate, 'yyyy-MM-dd');
            debugData.sessionsByDate[dateKey] = (debugData.sessionsByDate[dateKey] || 0) + 1;

            // Check duration
            if (session.duration_ms && session.duration_ms > 0) {
              debugData.sessionsWithDuration++;
            }

            debugData.validSessions++;
            processedSessions.push(session);

            // Sample data for debugging
            if (debugData.sampleSessions.length < 5) {
              debugData.sampleSessions.push({
                id: session.id,
                start_time: session.start_time,
                parsed_date: format(startDate, 'yyyy-MM-dd HH:mm:ss'),
                duration_ms: session.duration_ms,
                duration_minutes: session.duration_ms ? Math.round(session.duration_ms / 60000) : 0,
                timer_name: session.timers?.name || 'Unknown'
              });
            }

          } catch (error) {
            debugData.invalidSessions++;
            debugData.dateParsingErrors.push(`Session ${session.id}: parsing error ${error}`);
          }
        });

        console.log('🔍 Session processing complete:', debugData);
        console.log('🔍 Sessions by date:', debugData.sessionsByDate);
        console.log('🔍 Sample sessions:', debugData.sampleSessions);

        setSessions(processedSessions);
        setDebugInfo(debugData);
        
      } catch (error) {
        console.error("Exception loading timer sessions:", error);
        setSessions([]);
        setDebugInfo({ exception: String(error) });
      } finally {
        setLoading(false);
      }
    };

    loadAndDebugSessions();
  }, [user]);

  return {
    sessions,
    loading,
    debugInfo
  };
};
