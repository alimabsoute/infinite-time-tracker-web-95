
import { usePomodoroSessionManagement } from './usePomodoroSessionManagement';
import { PomodoroSettings } from '@/types/pomodoro';

export const usePomodoroTimer = (
  timerId: string | undefined,
  settings: PomodoroSettings,
  sessionCount: number,
  totalSessions: number,
  saveSessionData: (sessionCount: number, totalSessions: number) => void
) => {
  const {
    isActive,
    currentSession,
    currentPhase,
    startSession,
    completeSession,
    stopSession,
  } = usePomodoroSessionManagement(timerId, settings, sessionCount, totalSessions, saveSessionData);

  return {
    isActive,
    currentSession,
    currentPhase,
    startSession,
    completeSession,
    stopSession,
  };
};
