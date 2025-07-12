
import { useMemo } from 'react';
import { differenceInDays } from 'date-fns';
import { TimerSessionWithTimer } from "../../../types";
import DataValidator from './DataValidator';

interface BubbleData {
  id: string;
  position: [number, number, number];
  size: number;
  color: string;
  timerName: string;
  totalTime: number;
  sessionCount: number;
  creationDate: Date;
  category: string;
}

interface BubbleDataProcessorProps {
  sessions: TimerSessionWithTimer[];
  currentWeekStart: Date;
  onError?: (error: Error) => void;
}

export const useBubbleDataProcessor = ({
  sessions,
  currentWeekStart,
  onError
}: BubbleDataProcessorProps): BubbleData[] => {
  return useMemo(() => {
    try {
      console.log('🔍 BubbleDataProcessor - Processing sessions:', sessions.length);
      
      const validation = DataValidator.validateSessions(sessions, currentWeekStart);
      
      if (!validation.hasValidData) {
        console.log('🔍 BubbleDataProcessor - No valid data for bubbles');
        return [];
      }

      // Convert timer groups to bubble data
      const bubbleData: BubbleData[] = Object.entries(validation.timerGroups).map(([timerName, data], index) => {
        try {
          // Safe position calculation
          const daysFromWeekStart = differenceInDays(data.createdAt, currentWeekStart);
          const xPosition = Math.max(-8, Math.min(8, (daysFromWeekStart / 7) * 6));
          const yPosition = (Math.random() - 0.5) * 4;
          const zPosition = (Math.random() - 0.5) * 3;
          
          // Safe size calculation
          const timeInHours = Math.max(0, data.totalTime / 3600000);
          const size = Math.max(0.3, Math.min(2.5, Math.log(timeInHours + 1) * 0.8));
          
          // Validate all values
          const position: [number, number, number] = [xPosition, yPosition, zPosition];
          if (position.some(p => !isFinite(p))) {
            throw new Error(`Invalid position for timer: ${timerName}`);
          }
          
          if (!isFinite(size) || size <= 0) {
            throw new Error(`Invalid size for timer: ${timerName}`);
          }
          
          // Category-based colors - ensure category is always set
          const colors: Record<string, string> = {
            'Work': '#3b82f6',
            'Personal': '#10b981',
            'Study': '#f59e0b',
            'Exercise': '#ef4444',
            'Health': '#8b5cf6',
            'Learning': '#06b6d4',
            'Uncategorized': '#6b7280'
          };
          const category = data.category || 'Uncategorized';
          const color = colors[category] || colors.Uncategorized;
          
          return {
            id: `${timerName}-${index}`,
            position,
            size,
            color,
            timerName,
            totalTime: data.totalTime,
            sessionCount: data.sessions.length,
            creationDate: data.createdAt,
            category
          };
        } catch (error) {
          console.error('🔍 BubbleDataProcessor - Error creating bubble for timer:', timerName, error);
          return null;
        }
      }).filter((bubble): bubble is BubbleData => bubble !== null);

      console.log('🔍 BubbleDataProcessor - Generated bubbles:', bubbleData.length);
      return bubbleData;
    } catch (error) {
      console.error('🔍 BubbleDataProcessor - Error processing bubbles:', error);
      onError?.(error as Error);
      return [];
    }
  }, [sessions, currentWeekStart, onError]);
};
