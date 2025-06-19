
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PomodoroSettings } from '@/types/pomodoro';

export const usePomodoroNotifications = (settings: PomodoroSettings) => {
  const { toast } = useToast();

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

  // Show session start notification
  const showSessionStartNotification = useCallback((type: 'work' | 'short-break' | 'long-break', duration: number) => {
    toast({
      title: `${type === 'work' ? 'Work' : 'Break'} session started`,
      description: `${Math.floor(duration / 60000)} minutes on the clock`,
    });
  }, [toast]);

  // Show session completion notification
  const showSessionCompletionNotification = useCallback((
    sessionType: 'work' | 'short-break' | 'long-break',
    isLongBreakTime: boolean
  ) => {
    if (sessionType === 'work') {
      toast({
        title: "Work session completed! 🍅",
        description: `Time for a ${isLongBreakTime ? 'long' : 'short'} break`,
      });
    } else {
      toast({
        title: "Break completed!",
        description: "Ready to get back to work?",
      });
    }
  }, [toast]);

  // Show session stop notification
  const showSessionStopNotification = useCallback(() => {
    toast({
      title: "Pomodoro session stopped",
      description: "Session has been cancelled",
    });
  }, [toast]);

  return {
    playNotificationSound,
    showSessionStartNotification,
    showSessionCompletionNotification,
    showSessionStopNotification
  };
};
