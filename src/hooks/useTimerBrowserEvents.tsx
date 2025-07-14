
import { useCallback } from 'react';
import { Timer } from '../types';
import { useBrowserEvents } from './useBrowserEvents';
import { useTimerPersistenceEnhanced } from './useTimerPersistenceEnhanced';
import { useTimerDatabaseCleanup } from './useTimerDatabaseCleanup';
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
  const { auditDatabaseState, ensureSingleRunningTimer } = useTimerDatabaseCleanup();

  // Enhanced validation function with database consistency checks
  const validateAndRestoreTimerState = useCallback(async (
    persistenceData: any,
    reason: string
  ): Promise<boolean> => {
    if (!user || !persistenceData?.timers) return false;

    console.log(`🔍 [BROWSER EVENTS] Enhanced validation started for ${persistenceData.timers.length} persisted timers (${reason})`);
    
    try {
      // STEP 1: Audit current database state
      console.log('🔍 [BROWSER EVENTS] Step 1: Auditing database state');
      const auditResult = await auditDatabaseState();
      if (!auditResult) {
        console.error('❌ [BROWSER EVENTS] Database audit failed, cannot validate state');
        return false;
      }

      console.log('📊 [BROWSER EVENTS] Database audit results:', {
        totalTimers: auditResult.allTimers.length,
        runningInDB: auditResult.runningTimers.length,
        runningInPersistence: persistenceData.timers.filter((t: any) => t.isRunning).length,
        hasMultipleRunning: auditResult.hasMultipleRunning
      });

      // STEP 2: Fix database consistency if needed
      if (auditResult.hasMultipleRunning) {
        console.warn('⚠️ [BROWSER EVENTS] Multiple timers running in database, fixing consistency');
        const cleanupResult = await ensureSingleRunningTimer();
        if (!cleanupResult.success) {
          console.error('❌ [BROWSER EVENTS] Failed to fix database consistency:', cleanupResult.error);
          return false;
        }
        console.log('✅ [BROWSER EVENTS] Database consistency restored');
      }

      // STEP 3: Get fresh database state after potential cleanup
      const { data: dbTimers, error } = await supabase
        .from('timers')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null);

      if (error) {
        console.error('❌ [BROWSER EVENTS] Database query failed during validation:', error);
        return false;
      }

      // STEP 4: Enhanced validation with database authority
      console.log('🔍 [BROWSER EVENTS] Step 4: Validating persisted timers against database');
      const validatedTimers = persistenceData.timers
        .map((persistedTimer: any) => {
          const dbTimer = dbTimers?.find(t => t.id === persistedTimer.id);
          if (!dbTimer) {
            console.log(`⚠️ [BROWSER EVENTS] Timer ${persistedTimer.id} no longer exists in database, removing from state`);
            return null;
          }

          // Database is the source of truth for running state
          const isRunning = dbTimer.is_running;
          
          // Use the higher of persisted or database elapsed time
          const elapsedTime = Math.max(persistedTimer.elapsedTime || 0, dbTimer.elapsed_time || 0);
          
          console.log(`✅ [BROWSER EVENTS] Validated timer ${persistedTimer.id}:`, {
            name: dbTimer.name,
            dbRunning: dbTimer.is_running,
            persistedRunning: persistedTimer.isRunning,
            finalRunning: isRunning,
            dbElapsed: dbTimer.elapsed_time,
            persistedElapsed: persistedTimer.elapsedTime,
            finalElapsed: elapsedTime
          });
          
          return {
            id: dbTimer.id,
            name: dbTimer.name,
            elapsedTime,
            isRunning,
            createdAt: new Date(dbTimer.created_at),
            category: dbTimer.category,
            priority: dbTimer.priority,
            deadline: dbTimer.deadline ? new Date(dbTimer.deadline) : undefined,
            // Only set session data if timer is actually running in database
            currentSessionId: isRunning ? persistedTimer.currentSessionId : undefined,
            sessionStartTime: isRunning && persistedTimer.sessionStartTime 
              ? new Date(persistedTimer.sessionStartTime) 
              : undefined,
          };
        })
        .filter(Boolean);

      // STEP 5: Final consistency check
      const runningCount = validatedTimers.filter(t => t.isRunning).length;
      if (runningCount > 1) {
        console.error('❌ [BROWSER EVENTS] CRITICAL: Validated state has multiple running timers:', runningCount);
        // Force only the first running timer to stay running
        let foundFirstRunning = false;
        validatedTimers.forEach(timer => {
          if (timer.isRunning) {
            if (foundFirstRunning) {
              timer.isRunning = false;
              timer.currentSessionId = undefined;
              timer.sessionStartTime = undefined;
              console.log(`🛑 [BROWSER EVENTS] Forced stop timer ${timer.id} to maintain consistency`);
            } else {
              foundFirstRunning = true;
            }
          }
        });
      }

      if (validatedTimers.length > 0) {
        console.log(`✅ [BROWSER EVENTS] Restored ${validatedTimers.length} validated timers (${validatedTimers.filter(t => t.isRunning).length} running)`);
        setTimers(validatedTimers);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ [BROWSER EVENTS] Enhanced validation failed:', error);
      return false;
    }
  }, [user, setTimers, auditDatabaseState, ensureSingleRunningTimer]);

  // Browser event handlers with enhanced persistence
  const browserEventHandlers = {
    onVisibilityChange: useCallback(async (isVisible: boolean) => {
      console.log(`👁️ Visibility changed: ${isVisible ? 'visible' : 'hidden'}`);
      isPageVisibleRef.current = isVisible;
      
      if (!isVisible) {
        // Save immediately when page becomes hidden
        enhancedSaveTimerState(timersRef, 'visibility');
        batchSyncTimers(timersRef.current, true);
      } else {
        // Enhanced restore when page becomes visible
        const persistenceData = loadTimerState();
        if (persistenceData) {
          console.log('🔄 [BROWSER EVENTS] Enhanced restore from persistence on visibility change');
          await validateAndRestoreTimerState(persistenceData, 'visibility-restore');
        }
      }
    }, [enhancedSaveTimerState, batchSyncTimers, loadTimerState, validateAndRestoreTimerState, timersRef, isPageVisibleRef]),

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
      console.log('👁️ [BROWSER EVENTS] Page show - enhanced restoration');
      if (!user) return;
      
      const persistenceData = loadTimerState();
      if (persistenceData && persistenceData.timers.length > 0) {
        await validateAndRestoreTimerState(persistenceData, 'page-show');
      }
    }, [user, loadTimerState, validateAndRestoreTimerState]),

    onFocus: useCallback(async () => {
      console.log('🎯 [BROWSER EVENTS] Window focus - enhanced validation');
      if (!user) return;
      
      const persistenceData = loadTimerState();
      if (persistenceData && persistenceData.timers.length > 0) {
        await validateAndRestoreTimerState(persistenceData, 'window-focus');
      }
    }, [user, loadTimerState, validateAndRestoreTimerState]),

    onBlur: useCallback(() => {
      console.log('😴 Window blur - saving timer state');
      enhancedSaveTimerState(timersRef, 'blur');
    }, [enhancedSaveTimerState, timersRef])
  };

  // Register browser event handlers
  useBrowserEvents(browserEventHandlers);
};
