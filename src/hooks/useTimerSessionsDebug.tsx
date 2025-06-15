
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "../contexts/AuthContext";
import { TimerSessionWithTimer } from "../types";
import { parseISO, isValid, format } from 'date-fns';

interface ValidationStats {
  totalSessions: number;
  validSessions: number;
  invalidSessions: number;
  errors: string[];
  warnings: string[];
}

export const useTimerSessionsDebug = () => {
  const [sessions, setSessions] = useState<TimerSessionWithTimer[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [validationStats, setValidationStats] = useState<ValidationStats | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      setDebugInfo({ error: 'No authenticated user' });
      return;
    }

    const loadAndValidateSessions = async () => {
      try {
        setLoading(true);
        console.log('🔍 Loading sessions for user:', user.id);
        
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
          console.error("❌ Error loading timer sessions:", error);
          setSessions([]);
          setDebugInfo({ error: error.message, code: error.code });
          return;
        }

        const rawSessions = data || [];
        console.log('✅ Successfully loaded', rawSessions.length, 'raw sessions');

        // Comprehensive validation and processing
        const validationStats: ValidationStats = {
          totalSessions: rawSessions.length,
          validSessions: 0,
          invalidSessions: 0,
          errors: [],
          warnings: []
        };

        const processedSessions: TimerSessionWithTimer[] = [];
        const sessionsByDate: Record<string, number> = {};
        const sampleSessions: any[] = [];

        for (const [index, session] of rawSessions.entries()) {
          const sessionId = session.id || `session-${index}`;
          
          try {
            // Validate start_time
            if (!session.start_time) {
              validationStats.errors.push(`Session ${sessionId}: Missing start_time`);
              validationStats.invalidSessions++;
              continue;
            }

            const startDate = parseISO(session.start_time);
            if (!isValid(startDate)) {
              validationStats.errors.push(`Session ${sessionId}: Invalid start_time ${session.start_time}`);
              validationStats.invalidSessions++;
              continue;
            }

            // Track by date
            const dateKey = format(startDate, 'yyyy-MM-dd');
            sessionsByDate[dateKey] = (sessionsByDate[dateKey] || 0) + 1;

            // Validate duration
            if (session.duration_ms !== null && session.duration_ms !== undefined) {
              if (typeof session.duration_ms !== 'number' || session.duration_ms < 0) {
                validationStats.warnings.push(`Session ${sessionId}: Invalid duration ${session.duration_ms}`);
              }
            }

            // Add to valid sessions
            processedSessions.push(session);
            validationStats.validSessions++;

            // Collect sample data
            if (sampleSessions.length < 5) {
              sampleSessions.push({
                id: session.id,
                start_time: session.start_time,
                parsed_date: format(startDate, 'yyyy-MM-dd HH:mm:ss'),
                duration_ms: session.duration_ms,
                duration_hours: session.duration_ms ? (session.duration_ms / 3600000).toFixed(3) : 0,
                timer_name: session.timers?.name || 'Unknown',
                timer_category: session.timers?.category || 'Uncategorized'
              });
            }

          } catch (error) {
            validationStats.errors.push(`Session ${sessionId}: Processing error ${error}`);
            validationStats.invalidSessions++;
          }
        }

        const finalDebugInfo = {
          totalRawSessions: rawSessions.length,
          validSessions: validationStats.validSessions,
          invalidSessions: validationStats.invalidSessions,
          validationRate: `${((validationStats.validSessions / rawSessions.length) * 100).toFixed(1)}%`,
          sessionsByDate,
          sampleSessions,
          errors: validationStats.errors,
          warnings: validationStats.warnings,
          totalHoursTracked: processedSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0) / 3600000,
          dateRange: processedSessions.length > 0 ? {
            earliest: format(parseISO(processedSessions[processedSessions.length - 1].start_time), 'yyyy-MM-dd'),
            latest: format(parseISO(processedSessions[0].start_time), 'yyyy-MM-dd')
          } : null
        };

        console.log('🔍 Complete session validation result:', finalDebugInfo);

        setSessions(processedSessions);
        setDebugInfo(finalDebugInfo);
        setValidationStats(validationStats);
        
      } catch (error) {
        console.error("❌ Exception during session loading:", error);
        setSessions([]);
        setDebugInfo({ exception: String(error) });
        setValidationStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadAndValidateSessions();
  }, [user]);

  return {
    sessions,
    loading,
    debugInfo,
    validationStats
  };
};
