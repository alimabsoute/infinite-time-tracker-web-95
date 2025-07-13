
import { useMemo } from 'react';
import { TimerSessionWithTimer } from "../../../types";
import { ProcessedData } from './types/ProcessedData';
import { filterSessionsInDateRange } from './utils/SessionFilter';
import { groupSessionsByTimer } from './utils/TimerGrouping';
import { calculateBubblePosition, calculateBubbleSize } from './utils/PositionCalculator';
import { getCategoryColor } from './utils/ColorUtils';

interface DateRangeDataProcessorProps {
  sessions: TimerSessionWithTimer[];
  startDate: Date;
  endDate: Date;
  onError?: (error: Error) => void;
}

export const useDateRangeDataProcessor = ({
  sessions,
  startDate,
  endDate,
  onError
}: DateRangeDataProcessorProps): ProcessedData[] => {
  return useMemo(() => {
    console.log('🔍 DateRangeDataProcessor - Processing sessions:', {
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

      // Convert to processed data
      const processedData: ProcessedData[] = Object.entries(timerGroups).map(([timerName, data], index) => {
        try {
          // Position calculation
          const position = calculateBubblePosition(data.createdAt, startDate, endDate);
          
          // Size calculation
          const size = calculateBubbleSize(data.totalTime);
          
          // Validate values
          if (!isFinite(position[0]) || !isFinite(position[1]) || !isFinite(position[2]) || !isFinite(size)) {
            console.warn('🔍 DateRangeDataProcessor - Invalid values for timer:', timerName);
            return null;
          }
          
          // Get color
          const color = getCategoryColor(data.category, data.isRunning);
          
          const processedItem: ProcessedData = {
            id: `${timerName}-${index}`,
            position,
            size,
            color,
            timerName,
            totalTime: data.totalTime,
            sessionCount: data.sessions.length,
            creationDate: data.createdAt,
            category: data.category,
            isRunning: data.isRunning
          };
          
          console.log('🔍 DateRangeDataProcessor - Created processed data:', {
            timerName: processedItem.timerName,
            totalTime: processedItem.totalTime,
            sessionCount: processedItem.sessionCount,
            isRunning: processedItem.isRunning,
            color: processedItem.color
          });
          
          return processedItem;
        } catch (error) {
          console.error('🔍 DateRangeDataProcessor - Error creating processed data for timer:', timerName, error);
          onError?.(error as Error);
          return null;
        }
      }).filter((item): item is ProcessedData => item !== null);

      console.log('🔍 DateRangeDataProcessor - Generated processed data:', {
        total: processedData.length,
        running: processedData.filter(b => b.isRunning).length,
        stopped: processedData.filter(b => !b.isRunning).length
      });
      
      return processedData;
    } catch (error) {
      console.error('🔍 DateRangeDataProcessor - Critical error:', error);
      onError?.(error as Error);
      return [];
    }
  }, [sessions, startDate, endDate, onError]);
};

export type { ProcessedData };
