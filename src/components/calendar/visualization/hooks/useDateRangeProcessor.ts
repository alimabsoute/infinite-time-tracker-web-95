
import { useMemo } from 'react';
import { TimerSessionWithTimer } from "../../../../types";
import { ProcessedData } from '../types/ProcessedData';
import { filterSessionsInDateRange } from '../utils/SessionFilter';
import { groupSessionsByTimer } from '../utils/TimerGrouping';
import { aggregateTimerData } from '../utils/DataAggregator';

interface UseDateRangeProcessorProps {
  sessions: TimerSessionWithTimer[];
  startDate: Date;
  endDate: Date;
  onError?: (error: Error) => void;
}

export const useDateRangeProcessor = ({
  sessions,
  startDate,
  endDate,
  onError
}: UseDateRangeProcessorProps): ProcessedData[] => {
  return useMemo(() => {
    console.log('🔍 useDateRangeProcessor - Processing sessions:', {
      totalSessions: sessions.length,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      sampleSessions: sessions.slice(0, 3).map(s => ({
        id: s.id,
        timer_id: s.timer_id,
        duration_ms: s.duration_ms,
        timer_name: s.timers?.name,
        isVirtual: s.id.startsWith('virtual-')
      }))
    });
    
    try {
      // Filter sessions within the date range
      const filteredSessions = filterSessionsInDateRange(sessions, startDate, endDate);
      
      // Group sessions by timer
      const timerGroups = groupSessionsByTimer(filteredSessions, onError);

      // Convert to processed data using the aggregator
      const processedData = aggregateTimerData(timerGroups, startDate, endDate, onError);

      console.log('🔍 useDateRangeProcessor - Generated processed data:', {
        total: processedData.length,
        running: processedData.filter(b => b.isRunning).length,
        stopped: processedData.filter(b => !b.isRunning).length
      });
      
      return processedData;
    } catch (error) {
      console.error('🔍 useDateRangeProcessor - Critical error:', error);
      onError?.(error as Error);
      return [];
    }
  }, [sessions, startDate, endDate, onError]);
};
