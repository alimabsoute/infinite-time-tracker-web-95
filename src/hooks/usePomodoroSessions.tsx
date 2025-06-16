
import { useState, useEffect, useCallback } from 'react';

interface SessionData {
  sessionCount: number;
  totalSessions: number;
  lastUpdated: string;
}

export const usePomodoroSessions = (timerId?: string) => {
  const [sessionCount, setSessionCount] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  // Load session data from localStorage for the specific timer
  useEffect(() => {
    if (!timerId) return;

    const savedSessionData = localStorage.getItem(`pomodoro-session-${timerId}`);
    if (savedSessionData) {
      try {
        const sessionData: SessionData = JSON.parse(savedSessionData);
        setSessionCount(sessionData.sessionCount || 0);
        setTotalSessions(sessionData.totalSessions || 0);
      } catch (error) {
        console.error('Error loading Pomodoro session data:', error);
      }
    }
  }, [timerId]);

  // Save session data to localStorage
  const saveSessionData = useCallback((newSessionCount: number, newTotalSessions: number) => {
    if (!timerId) return;
    
    const sessionData: SessionData = {
      sessionCount: newSessionCount,
      totalSessions: newTotalSessions,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(`pomodoro-session-${timerId}`, JSON.stringify(sessionData));
    setSessionCount(newSessionCount);
    setTotalSessions(newTotalSessions);
  }, [timerId]);

  // Clear session data
  const clearSessionData = useCallback(() => {
    if (!timerId) return;
    localStorage.removeItem(`pomodoro-session-${timerId}`);
    setSessionCount(0);
    setTotalSessions(0);
  }, [timerId]);

  return {
    sessionCount,
    totalSessions,
    saveSessionData,
    clearSessionData,
  };
};
