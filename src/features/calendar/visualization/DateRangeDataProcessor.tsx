
import { TimerSessionWithTimer } from "../../../types";
import { ProcessedData } from './types/ProcessedData';
import { useDateRangeProcessor } from './hooks/useDateRangeProcessor';

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
  return useDateRangeProcessor({ sessions, startDate, endDate, onError });
};

export type { ProcessedData };
