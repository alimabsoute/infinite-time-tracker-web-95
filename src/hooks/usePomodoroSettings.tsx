
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PomodoroSettings, DEFAULT_POMODORO_SETTINGS } from '@/types/pomodoro';

export const usePomodoroSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO_SETTINGS);

  // Load Pomodoro settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoro-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Error loading Pomodoro settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: PomodoroSettings) => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(newSettings));
    setSettings(newSettings);
    toast({
      title: "Settings saved",
      description: "Your Pomodoro preferences have been updated",
    });
  }, [toast]);

  return {
    settings,
    saveSettings,
  };
};
