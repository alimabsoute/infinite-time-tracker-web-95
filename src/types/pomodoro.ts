
export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
}

export interface PomodoroSession {
  id: string;
  timerId: string;
  type: 'work' | 'short-break' | 'long-break';
  duration: number; // in milliseconds
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  sessionNumber: number;
}

export interface PomodoroState {
  isActive: boolean;
  currentSession: PomodoroSession | null;
  sessionCount: number;
  totalSessions: number;
  currentPhase: 'work' | 'short-break' | 'long-break' | 'idle';
  settings: PomodoroSettings;
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  soundEnabled: true,
};
