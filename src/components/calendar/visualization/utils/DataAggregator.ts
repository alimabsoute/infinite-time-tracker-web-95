
import { ProcessedData } from '../types/ProcessedData';
import { TimerGroup } from './TimerGrouping';
import { calculateBubblePosition, calculateBubbleSize } from './PositionCalculator';
import { getCategoryColor } from './ColorUtils';

export const aggregateTimerData = (
  timerGroups: Record<string, TimerGroup>,
  startDate: Date,
  endDate: Date,
  onError?: (error: Error) => void
): ProcessedData[] => {
  console.log('🔍 DataAggregator - Aggregating timer data:', {
    groupCount: Object.keys(timerGroups).length
  });

  const processedData: ProcessedData[] = Object.entries(timerGroups).map(([timerName, data], index) => {
    try {
      // Position calculation
      const position = calculateBubblePosition(data.createdAt, startDate, endDate);
      
      // Size calculation
      const size = calculateBubbleSize(data.totalTime);
      
      // Validate values
      if (!isFinite(position[0]) || !isFinite(position[1]) || !isFinite(position[2]) || !isFinite(size)) {
        console.warn('🔍 DataAggregator - Invalid values for timer:', timerName);
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
      
      console.log('🔍 DataAggregator - Created processed data:', {
        timerName: processedItem.timerName,
        totalTime: processedItem.totalTime,
        sessionCount: processedItem.sessionCount,
        isRunning: processedItem.isRunning,
        color: processedItem.color
      });
      
      return processedItem;
    } catch (error) {
      console.error('🔍 DataAggregator - Error creating processed data for timer:', timerName, error);
      onError?.(error as Error);
      return null;
    }
  }).filter((item): item is ProcessedData => item !== null);

  console.log('🔍 DataAggregator - Aggregation complete:', {
    totalProcessed: processedData.length,
    runningTimers: processedData.filter(item => item.isRunning).length
  });

  return processedData;
};
