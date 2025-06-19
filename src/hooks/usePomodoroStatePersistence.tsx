
import { useCallback } from 'react';
import { PomodoroSession } from '@/types/pomodoro';

interface PersistedPomodoroState {
  isActive: boolean;
  currentSession: PomodoroSession | null;
  currentPhase: 'work' | 'short-break' | 'long-break' | 'idle';
  lastUpdated: string;
}

export const usePomodoroStatePersistence = (timerId?: string) => {
  // Load persisted state
  const loadPersistedState = useCallback((): PersistedPomodoroState | null => {
    if (!timerId) return null;

    const savedState = localStorage.getItem(`pomodoro-state-${timerId}`);
    if (!savedState) return null;

    try {
      const persistedState: PersistedPomodoroState = JSON.parse(savedState);
      
      // Only restore if state is recent (within last 5 minutes to handle browser refreshes)
      const lastUpdated = new Date(persistedState.lastUpdated);
      const now = new Date();
      const timeDiff = now.getTime() - lastUpdated.getTime();
      
      if (timeDiff < 5 * 60 * 1000) { // 5 minutes
        return {
          ...persistedState,
          currentSession: persistedState.currentSession ? {
            ...persistedState.currentSession,
            startTime: new Date(persistedState.currentSession.startTime),
          } : null
        };
      } else {
        // Clear expired state
        localStorage.removeItem(`pomodoro-state-${timerId}`);
        return null;
      }
    } catch (error) {
      console.error('Error loading persisted Pomodoro state:', error);
      localStorage.removeItem(`pomodoro-state-${timerId}`);
      return null;
    }
  }, [timerId]);

  // Persist state changes
  const persistState = useCallback((
    activeState: boolean,
    session: PomodoroSession | null,
    phase: 'work' | 'short-break' | 'long-break' | 'idle'
  ) => {
    if (!timerId) return;

    if (!activeState && phase === 'idle') {
      // Clear state when not active
      localStorage.removeItem(`pomodoro-state-${timerId}`);
    } else {
      const stateToSave: PersistedPomodoroState = {
        isActive: activeState,
        currentSession: session,
        currentPhase: phase,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(`pomodoro-state-${timerId}`, JSON.stringify(stateToSave));
    }
  }, [timerId]);

  // Clear persisted state
  const clearPersistedState = useCallback(() => {
    if (!timerId) return;
    localStorage.removeItem(`pomodoro-state-${timerId}`);
  }, [timerId]);

  return {
    loadPersistedState,
    persistState,
    clearPersistedState
  };
};
