
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  PomodoroSettings, 
  PomodoroSession, 
  PomodoroState, 
  DEFAULT_POMODORO_SETTINGS 
} from '@/types/pomodoro';

export const usePomodoro = (timerId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
    isActive: false,
    currentSession: null,
    sessionCount: 0,
    totalSessions: 0,
    currentPhase: 'idle',
    settings: DEFAULT_POMODORO_SETTINGS,
  });

  // Load Pomodoro settings from localStorage or use defaults
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoro-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setPomodoroState(prev => ({ ...prev, settings }));
      } catch (error) {
        console.error('Error loading Pomodoro settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((settings: PomodoroSettings) => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
    setPomodoroState(prev => ({ ...prev, settings }));
    toast({
      title: "Settings saved",
      description: "Your Pomodoro preferences have been updated",
    });
  }, [toast]);

  // Start a Pomodoro session
  const startPomodoroSession = useCallback((type: 'work' | 'short-break' | 'long-break' = 'work') => {
    if (!timerId) return;

    const duration = type === 'work' 
      ? pomodoroState.settings.workDuration * 60 * 1000
      : type === 'short-break'
      ? pomodoroState.settings.shortBreakDuration * 60 * 1000
      : pomodoroState.settings.longBreakDuration * 60 * 1000;

    const newSession: PomodoroSession = {
      id: crypto.randomUUID(),
      timerId,
      type,
      duration,
      startTime: new Date(),
      completed: false,
      sessionNumber: pomodoroState.sessionCount + 1,
    };

    setPomodoroState(prev => ({
      ...prev,
      isActive: true,
      currentSession: newSession,
      currentPhase: type,
      sessionCount: type === 'work' ? prev.sessionCount + 1 : prev.sessionCount,
    }));

    toast({
      title: `${type === 'work' ? 'Work' : 'Break'} session started`,
      description: `${Math.floor(duration / 60000)} minutes on the clock`,
    });
  }, [timerId, pomodoroState.settings, pomodoroState.sessionCount, toast]);

  // Complete current session
  const completePomodoroSession = useCallback(() => {
    if (!pomodoroState.currentSession) return;

    const completedSession = {
      ...pomodoroState.currentSession,
      endTime: new Date(),
      completed: true,
    };

    // Play notification sound if enabled
    if (pomodoroState.settings.soundEnabled) {
      // Create a simple beep sound
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
    }

    // Determine next phase
    let nextPhase: 'work' | 'short-break' | 'long-break' | null = null;
    let shouldAutoStart = false;

    if (completedSession.type === 'work') {
      const isLongBreakTime = pomodoroState.sessionCount % pomodoroState.settings.sessionsUntilLongBreak === 0;
      nextPhase = isLongBreakTime ? 'long-break' : 'short-break';
      shouldAutoStart = pomodoroState.settings.autoStartBreaks;
      
      toast({
        title: "Work session completed! 🍅",
        description: `Time for a ${isLongBreakTime ? 'long' : 'short'} break`,
      });
    } else {
      nextPhase = 'work';
      shouldAutoStart = pomodoroState.settings.autoStartWork;
      
      toast({
        title: "Break completed!",
        description: "Ready to get back to work?",
      });
    }

    setPomodoroState(prev => ({
      ...prev,
      isActive: false,
      currentSession: null,
      currentPhase: shouldAutoStart && nextPhase ? nextPhase : 'idle',
      totalSessions: prev.totalSessions + 1,
    }));

    // Auto-start next session if enabled
    if (shouldAutoStart && nextPhase) {
      setTimeout(() => {
        startPomodoroSession(nextPhase);
      }, 1000);
    }
  }, [pomodoroState, toast, startPomodoroSession]);

  // Stop current session
  const stopPomodoroSession = useCallback(() => {
    setPomodoroState(prev => ({
      ...prev,
      isActive: false,
      currentSession: null,
      currentPhase: 'idle',
    }));

    toast({
      title: "Pomodoro session stopped",
      description: "Session has been cancelled",
    });
  }, [toast]);

  // Reset Pomodoro cycle
  const resetPomodoroCycle = useCallback(() => {
    setPomodoroState(prev => ({
      ...prev,
      isActive: false,
      currentSession: null,
      sessionCount: 0,
      totalSessions: 0,
      currentPhase: 'idle',
    }));

    toast({
      title: "Pomodoro cycle reset",
      description: "Starting fresh with a new cycle",
    });
  }, [toast]);

  return {
    pomodoroState,
    startPomodoroSession,
    completePomodoroSession,
    stopPomodoroSession,
    resetPomodoroCycle,
    saveSettings,
  };
};
