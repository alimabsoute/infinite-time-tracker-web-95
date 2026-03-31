
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
    try {
      // Filter sessions within the date range
      const filteredSessions = filterSessionsInDateRange(sessions, startDate, endDate);
      
      // Group sessions by timer
      const timerGroups = groupSessionsByTimer(filteredSessions, onError);

      // Convert to processed data using the aggregator
      const processedData = aggregateTimerData(timerGroups, startDate, endDate, onError);

      
      return processedData;
    } catch (error) {
      console.error('useDateRangeProcessor - Critical error:', error);
      onError?.(error as Error);
      return [];
    }
  }, [sessions, startDate, endDate, onError]);
};
