
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
        console.warn('DataAggregator - Invalid values for timer:', timerName);
        return null;
      }
      
      // Get color
      const color = getCategoryColor(data.category, data.isRunning);
      
      // Calculate additional metrics for compatibility
      const avgSessionTime = data.totalTime / data.sessions.length;
      const totalHours = (data.totalTime / (1000 * 60 * 60)).toFixed(1);
      const avgMinutes = (avgSessionTime / (1000 * 60)).toFixed(1);
      
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
        isRunning: data.isRunning,
        // Additional properties for compatibility with BubbleData
        timerId: timerName, // Use timerName as timerId for consistency
        name: timerName,
        totalHours,
        avgMinutes,
        avgSessionTime,
        sessions: data.sessions,
        // 2D chart specific properties
        x: data.totalTime / (1000 * 60 * 60), // Total hours for X axis
        y: avgSessionTime / (1000 * 60) // Avg session minutes for Y axis
      };

      
      return processedItem;
    } catch (error) {
      console.error('DataAggregator - Error creating processed data for timer:', timerName, error);
      onError?.(error as Error);
      return null;
    }
  }).filter((item): item is ProcessedData => item !== null);


  return processedData;
};
