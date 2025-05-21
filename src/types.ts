
export interface Timer {
  id: string;
  name: string;
  elapsedTime: number; // in milliseconds
  isRunning: boolean;
  createdAt: Date;
  category?: string; // Optional category for grouping timers
  tags?: string[]; // Optional tags for filtering
  deadline?: Date; // Optional deadline for timer completion
  priority?: number; // Optional priority level (1-5, with 1 being highest)
}

export interface TimerChartData {
  name: string;
  time: number; // in milliseconds
  category?: string;
}

// New interface for time breakdown by category
export interface CategoryChartData {
  category: string;
  time: number; // in milliseconds
  percentage: number;
}

// Supabase database timer format (for reference)
export interface DbTimer {
  id: string;
  user_id: string;
  name: string;
  elapsed_time: number;
  is_running: boolean;
  created_at: string; // ISO string format
  category?: string;
  tags?: string[];
  deadline?: string; // ISO string format
  priority?: number;
}
