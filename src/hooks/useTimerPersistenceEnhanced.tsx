
import { useCallback, useRef } from 'react';
import { Timer } from '../types';
import { useTimerPersistence } from './useTimerPersistence';
import { useTimerSync } from './useTimerSync';

export const useTimerPersistenceEnhanced = () => {
  const { saveTimerState, loadTimerState, restoreTimerElapsedTime } = useTimerPersistence();
  const { batchSyncTimers } = useTimerSync();
  const lastAutoSaveRef = useRef(0);

  // Enhanced persistence with more frequent saves
  const enhancedSaveTimerState = useCallback((timersRef: React.MutableRefObject<Timer[]>, reason: string) => {
    const runningTimers = timersRef.current.filter(t => t.isRunning);
    if (runningTimers.length > 0) {
      saveTimerState(timersRef.current, reason as any);
      console.log(`💾 Enhanced save: ${runningTimers.length} running timers saved (${reason})`);
    }
  }, [saveTimerState]);

  // Enhanced auto-save with more frequent intervals
  const shouldAutoSave = useCallback((timersRef: React.MutableRefObject<Timer[]>): boolean => {
    const now = Date.now();
    const timeSinceLastSave = now - lastAutoSaveRef.current;
    
    // Save every 10 seconds instead of 30 seconds for better persistence
    if (timeSinceLastSave > 10000) {
      const runningTimers = timersRef.current.filter(t => t.isRunning);
      if (runningTimers.length > 0) {
        enhancedSaveTimerState(timersRef, 'auto-save');
        lastAutoSaveRef.current = now;
        return true;
      }
    }
    return false;
  }, [enhancedSaveTimerState]);

  // Enhanced timer update with better sync
  const handleTimerUpdateSave = useCallback((
    timersRef: React.MutableRefObject<Timer[]>, 
    isPageVisibleRef: React.MutableRefObject<boolean>
  ) => {
    const runningTimers = timersRef.current.filter(t => t.isRunning);
    if (runningTimers.length > 0) {
      const now = Date.now();
      // Save more frequently when timers are running
      if (now - lastAutoSaveRef.current > 5000) {
        enhancedSaveTimerState(timersRef, 'timer-update');
        lastAutoSaveRef.current = now;
      }
      
      // Sync to database every 10 seconds when page is visible
      if (isPageVisibleRef.current && now % 10000 < 1000) {
        batchSyncTimers(timersRef.current);
      }
    }
  }, [enhancedSaveTimerState, batchSyncTimers]);

  return {
    enhancedSaveTimerState,
    shouldAutoSave,
    handleTimerUpdateSave,
    loadTimerState,
    restoreTimerElapsedTime,
    batchSyncTimers
  };
};
