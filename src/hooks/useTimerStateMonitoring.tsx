
import { useEffect, useRef } from 'react';
import { Timer } from '../types';

export const useTimerStateMonitoring = (timers: Timer[]) => {
  const previousTimersRef = useRef<Timer[]>([]);
  const monitoringIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const currentRunning = timers.filter(t => t.isRunning);
    const previousRunning = previousTimersRef.current.filter(t => t.isRunning);

    // Detect unexpected state changes
    if (previousTimersRef.current.length > 0) {
      // Check for timers that stopped unexpectedly
      const unexpectedlyPaused = previousRunning.filter(prevTimer => 
        !currentRunning.some(currTimer => currTimer.id === prevTimer.id)
      );

      if (unexpectedlyPaused.length > 0) {
        console.warn('⚠️ UNEXPECTED TIMER PAUSE DETECTED:', {
          pausedTimers: unexpectedlyPaused.map(t => ({ id: t.id, name: t.name })),
          previousCount: previousRunning.length,
          currentCount: currentRunning.length,
          timestamp: new Date().toISOString()
        });
      }

      // Check for timers that started unexpectedly
      const unexpectedlyStarted = currentRunning.filter(currTimer => 
        !previousRunning.some(prevTimer => prevTimer.id === currTimer.id)
      );

      if (unexpectedlyStarted.length > 0) {
        console.log('▶️ TIMER STARTED:', {
          startedTimers: unexpectedlyStarted.map(t => ({ id: t.id, name: t.name })),
          previousCount: previousRunning.length,
          currentCount: currentRunning.length,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Update reference for next comparison
    previousTimersRef.current = [...timers];

    // Log current state every 30 seconds
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }

    monitoringIntervalRef.current = setInterval(() => {
      const running = timers.filter(t => t.isRunning);
      if (running.length > 0) {
        console.log('📊 TIMER STATE MONITOR:', {
          totalTimers: timers.length,
          runningTimers: running.length,
          runningNames: running.map(t => t.name),
          timestamp: new Date().toISOString(),
          localStorage: localStorage.getItem('phynx-running-timers') ? 'present' : 'empty'
        });
      }
    }, 30000);

    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, [timers]);

  // Log critical state information on mount
  useEffect(() => {
    console.log('🔍 TIMER STATE MONITORING INITIALIZED');
    console.log('📋 Initial localStorage state:', localStorage.getItem('phynx-running-timers'));
  }, []);
};
