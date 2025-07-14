
import { useCallback } from 'react';
import { Timer } from '../types';
import { useBrowserEvents } from './useBrowserEvents';
import { useTimerPersistenceEnhanced } from './useTimerPersistenceEnhanced';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

interface UseTimerBrowserEventsProps {
  timersRef: React.MutableRefObject<Timer[]>;
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
  isPageVisibleRef: React.MutableRefObject<boolean>;
}

export const useTimerBrowserEvents = ({ 
  timersRef, 
  setTimers, 
  isPageVisibleRef 
}: UseTimerBrowserEventsProps) => {
  const { user } = useAuth();
  const {
    enhancedSaveTimerState,
    loadTimerState,
    restoreTimerElapsedTime,
    batchSyncTimers
  } = useTimerPersistenceEnhanced();

  // Browser event handlers with enhanced persistence
  const browserEventHandlers = {
    onVisibilityChange: useCallback((isVisible: boolean) => {
      console.log(`👁️ Visibility changed: ${isVisible ? 'visible' : 'hidden'}`);
      isPageVisibleRef.current = isVisible;
      
      if (!isVisible) {
        // Save immediately when page becomes hidden
        enhancedSaveTimerState(timersRef, 'visibility');
        batchSyncTimers(timersRef.current, true);
      } else {
        // Restore when page becomes visible
        const persistenceData = loadTimerState();
        if (persistenceData) {
          console.log('🔄 Restoring timers from persistence on visibility change');
          setTimers(prevTimers => {
            const restoredTimers = restoreTimerElapsedTime(prevTimers, persistenceData);
            batchSyncTimers(restoredTimers, true);
            return restoredTimers;
          });
        }
      }
    }, [enhancedSaveTimerState, batchSyncTimers, loadTimerState, restoreTimerElapsedTime, setTimers, timersRef, isPageVisibleRef]),

    onBeforeUnload: useCallback(() => {
      console.log('⚠️ Before unload - saving timer state');
      enhancedSaveTimerState(timersRef, 'beforeunload');
      const runningTimers = timersRef.current.filter(t => t.isRunning);
      if (runningTimers.length > 0) {
        const syncData = runningTimers.map(timer => ({
          id: timer.id,
          elapsed_time: timer.elapsedTime,
          is_running: timer.isRunning
        }));
        
        try {
          navigator.sendBeacon('/api/sync-timers', JSON.stringify(syncData));
        } catch (error) {
          console.error('Failed to send beacon:', error);
        }
      }
    }, [enhancedSaveTimerState, timersRef]),

    onPageHide: useCallback(() => {
      console.log('👋 Page hide - saving timer state');
      enhancedSaveTimerState(timersRef, 'pagehide');
      batchSyncTimers(timersRef.current, true);
    }, [enhancedSaveTimerState, batchSyncTimers, timersRef]),

    onPageShow: useCallback(async () => {
      console.log('👁️ Page show - restoring timer state');
      if (!user) return;
      
      const persistenceData = loadTimerState();
      if (persistenceData && persistenceData.timers.length > 0) {
        console.log('🔄 Validating timer state against database...');
        
        // Get current database state to validate against
        const { data: dbTimers } = await supabase
          .from('timers')
          .select('id, is_running')
          .eq('user_id', user.id);
        
        if (dbTimers) {
          const dbRunningTimers = new Set(dbTimers.filter(t => t.is_running).map(t => t.id));
          
          // Only restore timers that are actually running in the database
          const validTimers = persistenceData.timers.filter(timer => 
            dbRunningTimers.has(timer.id)
          );
          
          if (validTimers.length > 0) {
            console.log('🔄 Restoring validated timer state');
            const validatedPersistenceData = { ...persistenceData, timers: validTimers };
            setTimers(prevTimers => {
              const restoredTimers = restoreTimerElapsedTime(prevTimers, validatedPersistenceData);
              batchSyncTimers(restoredTimers, true);
              return restoredTimers;
            });
          } else {
            console.log('⚠️ No valid timer states to restore');
          }
        }
      }
    }, [loadTimerState, restoreTimerElapsedTime, batchSyncTimers, setTimers, user]),

    onFocus: useCallback(async () => {
      console.log('🎯 Window focus - checking for timer state');
      if (!user) return;
      
      const persistenceData = loadTimerState();
      if (persistenceData && persistenceData.timers.length > 0) {
        console.log('🔄 Validating timer state against database on focus...');
        
        // Get current database state to validate against
        const { data: dbTimers } = await supabase
          .from('timers')
          .select('id, is_running')
          .eq('user_id', user.id);
        
        if (dbTimers) {
          const dbRunningTimers = new Set(dbTimers.filter(t => t.is_running).map(t => t.id));
          
          // Only restore timers that are actually running in the database
          const validTimers = persistenceData.timers.filter(timer => 
            dbRunningTimers.has(timer.id)
          );
          
          if (validTimers.length > 0) {
            console.log('🔄 Restoring validated timer state on focus');
            const validatedPersistenceData = { ...persistenceData, timers: validTimers };
            setTimers(prevTimers => restoreTimerElapsedTime(prevTimers, validatedPersistenceData));
          }
        }
      }
    }, [loadTimerState, restoreTimerElapsedTime, setTimers, user]),

    onBlur: useCallback(() => {
      console.log('😴 Window blur - saving timer state');
      enhancedSaveTimerState(timersRef, 'blur');
    }, [enhancedSaveTimerState, timersRef])
  };

  // Register browser event handlers
  useBrowserEvents(browserEventHandlers);
};
