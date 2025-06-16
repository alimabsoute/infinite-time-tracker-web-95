
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PomodoroState } from '@/types/pomodoro';
import { usePomodoroSettings } from './usePomodoroSettings';
import { usePomodoroSessions } from './usePomodoroSessions';
import { usePomodoroTimer } from './usePomodoroTimer';

export const usePomodoro = (timerId?: string) => {
  const { toast } = useToast();
  
  // Compose smaller hooks
  const { settings, saveSettings } = usePomodoroSettings();
  const { sessionCount, totalSessions, saveSessionData, clearSessionData } = usePomodoroSessions(timerId);
  const { 
    isActive, 
    currentSession, 
    currentPhase, 
    startSession, 
    completeSession, 
    stopSession 
  } = usePomodoroTimer(timerId, settings, sessionCount, totalSessions, saveSessionData);

  // Create the composed state object
  const pomodoroState: PomodoroState = {
    isActive,
    currentSession,
    sessionCount,
    totalSessions,
    currentPhase,
    settings,
  };

  // Reset Pomodoro cycle
  const resetPomodoroCycle = useCallback(() => {
    stopSession();
    clearSessionData();

    toast({
      title: "Pomodoro cycle reset",
      description: "Starting fresh with a new cycle",
    });
  }, [stopSession, clearSessionData, toast]);

  // Expose the main API with renamed methods for consistency
  return {
    pomodoroState,
    startPomodoroSession: startSession,
    completePomodoroSession: completeSession,
    stopPomodoroSession: stopSession,
    resetPomodoroCycle,
    saveSettings,
  };
};
