
import { useState, useCallback, useEffect, useRef } from 'react';
import { PomodoroSession, PomodoroSettings } from '@/types/pomodoro';
import { usePomodoroNotifications } from './usePomodoroNotifications';
import { usePomodoroStatePersistence } from './usePomodoroStatePersistence';

export const usePomodoroSessionManagement = (
  timerId: string | undefined,
  settings: PomodoroSettings,
  sessionCount: number,
  totalSessions: number,
  saveSessionData: (sessionCount: number, totalSessions: number) => void
) => {
  const [isActive, setIsActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'work' | 'short-break' | 'long-break' | 'idle'>('idle');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stateLoadedRef = useRef(false);

  const { loadPersistedState, persistState, clearPersistedState } = usePomodoroStatePersistence(timerId);
  const {
    playNotificationSound,
    showSessionStartNotification,
    showSessionCompletionNotification,
    showSessionStopNotification
  } = usePomodoroNotifications(settings);

  // Load persisted state on mount
  useEffect(() => {
    if (!timerId || stateLoadedRef.current) return;

    const persistedState = loadPersistedState();
    if (persistedState) {
      setIsActive(persistedState.isActive);
      setCurrentPhase(persistedState.currentPhase);
      setCurrentSession(persistedState.currentSession);
    }
    stateLoadedRef.current = true;
  }, [timerId, loadPersistedState]);

  // Complete current session
  const completeSession = useCallback(() => {
    if (!currentSession) return;

    const completedSession = {
      ...currentSession,
      endTime: new Date(),
      completed: true,
    };

    playNotificationSound();

    // Determine next phase
    let nextPhase: 'work' | 'short-break' | 'long-break' | null = null;
    let shouldAutoStart = false;

    if (completedSession.type === 'work') {
      const isLongBreakTime = sessionCount % settings.sessionsUntilLongBreak === 0;
      nextPhase = isLongBreakTime ? 'long-break' : 'short-break';
      shouldAutoStart = settings.autoStartBreaks;
      
      showSessionCompletionNotification(completedSession.type, isLongBreakTime);
    } else {
      nextPhase = 'work';
      shouldAutoStart = settings.autoStartWork;
      
      showSessionCompletionNotification(completedSession.type, false);
    }

    const newTotalSessions = totalSessions + 1;

    setIsActive(false);
    setCurrentSession(null);
    setCurrentPhase(shouldAutoStart && nextPhase ? nextPhase : 'idle');

    // Persist state
    persistState(false, null, shouldAutoStart && nextPhase ? nextPhase : 'idle');

    // Save updated session data
    saveSessionData(sessionCount, newTotalSessions);

    // Auto-start next session if enabled
    if (shouldAutoStart && nextPhase) {
      setTimeout(() => {
        startSession(nextPhase);
      }, 1000);
    }
  }, [currentSession, sessionCount, totalSessions, settings, playNotificationSound, showSessionCompletionNotification, saveSessionData, persistState]);

  // Start a Pomodoro session
  const startSession = useCallback((type: 'work' | 'short-break' | 'long-break' = 'work') => {
    if (!timerId) return;

    const duration = type === 'work' 
      ? settings.workDuration * 60 * 1000
      : type === 'short-break'
      ? settings.shortBreakDuration * 60 * 1000
      : settings.longBreakDuration * 60 * 1000;

    const newSession: PomodoroSession = {
      id: crypto.randomUUID(),
      timerId,
      type,
      duration,
      startTime: new Date(),
      completed: false,
      sessionNumber: sessionCount + 1,
    };

    const newSessionCount = type === 'work' ? sessionCount + 1 : sessionCount;
    
    setIsActive(true);
    setCurrentSession(newSession);
    setCurrentPhase(type);

    // Persist state immediately
    persistState(true, newSession, type);

    // Save session data
    saveSessionData(newSessionCount, totalSessions);

    showSessionStartNotification(type, duration);
  }, [timerId, settings, sessionCount, totalSessions, saveSessionData, persistState, showSessionStartNotification]);

  // Stop current session
  const stopSession = useCallback(() => {
    setIsActive(false);
    setCurrentSession(null);
    setCurrentPhase('idle');

    // Clear persisted state
    persistState(false, null, 'idle');

    showSessionStopNotification();
  }, [persistState, showSessionStopNotification]);

  // Auto-complete timer when duration is reached
  useEffect(() => {
    if (!isActive || !currentSession) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - currentSession.startTime.getTime();
      const remaining = currentSession.duration - elapsed;
      
      if (remaining <= 0) {
        completeSession();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, currentSession, completeSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isActive,
    currentSession,
    currentPhase,
    startSession,
    completeSession,
    stopSession,
    clearPersistedState
  };
};
