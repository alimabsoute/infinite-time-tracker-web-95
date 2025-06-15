
export interface Timer {
  id: string;
  name: string;
  elapsedTime: number;
  isRunning: boolean;
  createdAt: Date;
  category?: string;
  tags?: string[];
  deadline?: Date;
  priority?: number;
  // Local state for session management
  currentSessionId?: string;
  sessionStartTime?: Date;
}

export interface TimerSession {
  id: string;
  timer_id: string;
  user_id: string;
  start_time: string; // ISO string
  end_time?: string; // ISO string
  duration_ms?: number;
}

// Type for sessions joined with timer info
export type TimerSessionWithTimer = TimerSession & {
  timers: {
    id: string;
    name: string;
    category: string | null;
  } | null;
};
