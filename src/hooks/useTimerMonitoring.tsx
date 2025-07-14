import { useEffect, useRef } from 'react';
import { Timer } from '../types';
import { useTimerStateValidator } from './useTimerStateValidator';

interface TimerStateSnapshot {
  timestamp: number;
  runningCount: number;
  runningIds: string[];
  reason: string;
}

export const useTimerMonitoring = (timers: Timer[]) => {
  const { validateTimerState } = useTimerStateValidator();
  const stateHistoryRef = useRef<TimerStateSnapshot[]>([]);
  const lastValidationRef = useRef(0);

  // Log state changes for debugging
  useEffect(() => {
    const runningTimers = timers.filter(t => t.isRunning);
    const snapshot: TimerStateSnapshot = {
      timestamp: Date.now(),
      runningCount: runningTimers.length,
      runningIds: runningTimers.map(t => t.id),
      reason: 'state-change'
    };

    // Add to history
    stateHistoryRef.current.push(snapshot);
    
    // Keep only last 50 snapshots
    if (stateHistoryRef.current.length > 50) {
      stateHistoryRef.current = stateHistoryRef.current.slice(-50);
    }

    // Log significant changes
    const prev = stateHistoryRef.current[stateHistoryRef.current.length - 2];
    if (prev && (prev.runningCount !== snapshot.runningCount || 
                 prev.runningIds.join(',') !== snapshot.runningIds.join(','))) {
      console.log('📊 Timer state change detected:', {
        from: { count: prev.runningCount, ids: prev.runningIds },
        to: { count: snapshot.runningCount, ids: snapshot.runningIds },
        timeSinceLastChange: snapshot.timestamp - prev.timestamp
      });
    }

    // Validate every 30 seconds
    if (snapshot.timestamp - lastValidationRef.current > 30000) {
      validateTimerState(timers, false).then(validation => {
        if (!validation.isValid) {
          console.warn('🚨 Timer state validation failed:', validation.errors);
        }
      });
      lastValidationRef.current = snapshot.timestamp;
    }
  }, [timers, validateTimerState]);

  // Expose monitoring data for debugging
  const getStateHistory = () => stateHistoryRef.current;
  
  const logCurrentState = () => {
    const runningTimers = timers.filter(t => t.isRunning);
    console.log('🔍 Current timer state:', {
      totalTimers: timers.length,
      runningTimers: runningTimers.length,
      runningDetails: runningTimers.map(t => ({
        id: t.id,
        name: t.name,
        elapsedTime: t.elapsedTime,
        sessionId: t.currentSessionId
      })),
      recentHistory: stateHistoryRef.current.slice(-5)
    });
  };

  // Add global debugging functions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugTimers = {
        logState: logCurrentState,
        getHistory: getStateHistory,
        validate: () => validateTimerState(timers, true)
      };
    }
  }, [timers, validateTimerState]);

  return {
    getStateHistory,
    logCurrentState
  };
};
