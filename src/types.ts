
export interface Timer {
  id: string;
  name: string;
  elapsedTime: number; // in milliseconds
  isRunning: boolean;
  createdAt: Date;
}

export interface TimerChartData {
  name: string;
  time: number; // in milliseconds
}
