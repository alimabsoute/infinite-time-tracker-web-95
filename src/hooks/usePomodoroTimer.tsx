
import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PomodoroSession, PomodoroSettings } from '@/types/pomodoro';

interface PersistedPomodoroState {
  isActive: boolean;
  currentSession: PomodoroSession | null;
  currentPhase: 'work' | 'short-break' | 'long-break' | 'idle';
  lastUpdated: string;
}

export const usePomodoroTimer = (
  timerId: string | undefined,
  settings: PomodoroSettings,
  sessionCount: number,
  totalSessions: number,
  saveSessionData: (sessionCount: number, totalSessions: number) => void
) => {
  const { toast } = useToast();
  
  const [isActive, setIsActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'work' | 'short-break' | 'long-break' | 'idle'>('idle');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stateLoadedRef = useRef(false);

  // Load persisted state on mount
  useEffect(() => {
    if (!timerId || stateLoadedRef.current) return;

    const savedState = localStorage.getItem(`pomodoro-state-${timerId}`);
    if (savedState) {
      try {
        const persistedState: PersistedPomodoroState = JSON.parse(savedState);
        
        // Only restore if state is recent (within last 5 minutes to handle browser refreshes)
        const lastUpdated = new Date(persistedState.lastUpdated);
        const now = new Date();
        const timeDiff = now.getTime() - lastUpdated.getTime();
        
        if (timeDiff < 5 * 60 * 1000) { // 5 minutes
          setIsActive(persistedState.isActive);
          setCurrentPhase(persistedState.currentPhase);
          
          if (persistedState.currentSession) {
            // Restore session with corrected start time
            const restoredSession = {
              ...persistedState.currentSession,
              startTime: new Date(persistedState.currentSession.startTime),
            };
            setCurrentSession(restoredSession);
          }
        } else {
          // Clear expired state
          localStorage.removeItem(`pomodoro-state-${timerId}`);
        }
      } catch (error) {
        console.error('Error loading persisted Pomodoro state:', error);
        localStorage.removeItem(`pomodoro-state-${timerId}`);
      }
    }
    stateLoadedRef.current = true;
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
  }, [isActive, currentSession]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!settings.soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [settings.soundEnabled]);

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

    toast({
      title: `${type === 'work' ? 'Work' : 'Break'} session started`,
      description: `${Math.floor(duration / 60000)} minutes on the clock`,
    });
  }, [timerId, settings, sessionCount, totalSessions, toast, saveSessionData, persistState]);

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
      
      toast({
        title: "Work session completed! 🍅",
        description: `Time for a ${isLongBreakTime ? 'long' : 'short'} break`,
      });
    } else {
      nextPhase = 'work';
      shouldAutoStart = settings.autoStartWork;
      
      toast({
        title: "Break completed!",
        description: "Ready to get back to work?",
      });
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
  }, [currentSession, sessionCount, totalSessions, settings, toast, playNotificationSound, saveSessionData, startSession, persistState]);

  // Stop current session
  const stopSession = useCallback(() => {
    setIsActive(false);
    setCurrentSession(null);
    setCurrentPhase('idle');

    // Clear persisted state
    persistState(false, null, 'idle');

    toast({
      title: "Pomodoro session stopped",
      description: "Session has been cancelled",
    });
  }, [toast, persistState]);

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
  };
};
