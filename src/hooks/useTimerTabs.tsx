
import { useState, useEffect, useCallback } from 'react';

const TIMER_TAB_STORAGE_KEY = 'timer-tab-preferences';

interface TimerTabPreferences {
  [timerId: string]: string;
}

export const useTimerTabs = (timerId: string, defaultTab: string = 'timer') => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // Load saved tab preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TIMER_TAB_STORAGE_KEY);
      if (saved) {
        const preferences: TimerTabPreferences = JSON.parse(saved);
        const savedTab = preferences[timerId];
        if (savedTab) {
          setActiveTab(savedTab);
        }
      }
    } catch (error) {
      console.error('Error loading timer tab preferences:', error);
    }
  }, [timerId]);

  // Save tab preference when it changes
  const handleTabChange = useCallback((newTab: string) => {
    setActiveTab(newTab);
    
    try {
      const saved = localStorage.getItem(TIMER_TAB_STORAGE_KEY);
      const preferences: TimerTabPreferences = saved ? JSON.parse(saved) : {};
      preferences[timerId] = newTab;
      localStorage.setItem(TIMER_TAB_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving timer tab preference:', error);
    }
  }, [timerId]);

  return {
    activeTab,
    setActiveTab: handleTabChange
  };
};
