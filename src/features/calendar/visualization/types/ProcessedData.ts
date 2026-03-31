
export interface ProcessedData {
  id: string;
  position: [number, number, number];
  size: number;
  color: string;
  timerName: string;
  totalTime: number;
  sessionCount: number;
  creationDate: Date;
  category: string;
  isRunning: boolean;
  // Additional properties for compatibility with BubbleData
  timerId: string;
  name: string;
  totalHours: string;
  avgMinutes: string;
  avgSessionTime: number;
  sessions: any[];
  // 2D chart specific properties
  x?: number;
  y?: number;
}
