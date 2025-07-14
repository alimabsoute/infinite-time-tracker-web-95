import { useCallback } from 'react';
import { Timer } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  correctedTimers?: Timer[];
  databaseInconsistencies?: {
    runningInDatabase: string[];
    stoppedInDatabase: string[];
    multipleRunning: boolean;
  };
}

interface DatabaseTimerState {
  id: string;
  name: string;
  elapsed_time: number;
  is_running: boolean;
  user_id: string;
}

export const useTimerStateValidator = () => {
  const { user } = useAuth();

  const validateDatabaseConsistency = useCallback(async (): Promise<{
    timers: DatabaseTimerState[];
    runningCount: number;
    hasMultipleRunning: boolean;
  } | null> => {
    if (!user) return null;

    try {
      const { data: timers, error } = await supabase
        .from('timers')
        .select('id, name, elapsed_time, is_running, user_id')
        .eq('user_id', user.id)
        .is('deleted_at', null);

      if (error) {
        console.error('❌ Database validation failed:', error);
        return null;
      }

      const runningTimers = timers?.filter(t => t.is_running) || [];
      const hasMultipleRunning = runningTimers.length > 1;

      console.log('🔍 Database consistency check:', {
        totalTimers: timers?.length || 0,
        runningTimers: runningTimers.length,
        hasMultipleRunning,
        runningIds: runningTimers.map(t => t.id)
      });

      return {
        timers: timers || [],
        runningCount: runningTimers.length,
        hasMultipleRunning
      };
    } catch (error) {
      console.error('❌ Database validation exception:', error);
      return null;
    }
  }, [user]);

  const fixDatabaseInconsistencies = useCallback(async (keepRunningTimerId?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('🔧 Fixing database inconsistencies...');
      
      // Get current database state
      const { data: runningTimers, error } = await supabase
        .from('timers')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_running', true)
        .is('deleted_at', null);

      if (error) {
        console.error('❌ Failed to query running timers:', error);
        return false;
      }

      if (!runningTimers || runningTimers.length <= 1) {
        console.log('✅ Database state is consistent');
        return true;
      }

      // Multiple running timers found - fix it
      const timersToStop = keepRunningTimerId 
        ? runningTimers.filter(t => t.id !== keepRunningTimerId)
        : runningTimers.slice(1); // Keep the first one, stop the rest

      if (timersToStop.length > 0) {
        const { error: stopError } = await supabase
          .from('timers')
          .update({ is_running: false })
          .in('id', timersToStop.map(t => t.id));

        if (stopError) {
          console.error('❌ Failed to stop conflicting timers:', stopError);
          return false;
        }

        // End any active sessions for stopped timers
        const { error: sessionError } = await supabase
          .from('timer_sessions')
          .update({ 
            end_time: new Date().toISOString(),
            duration_ms: 0 // We don't have the exact duration, so set to 0
          })
          .in('timer_id', timersToStop.map(t => t.id))
          .is('end_time', null);

        if (sessionError) {
          console.warn('⚠️ Failed to end sessions for stopped timers:', sessionError);
        }

        console.log('✅ Fixed database inconsistencies:', {
          stoppedTimers: timersToStop.length,
          stoppedIds: timersToStop.map(t => t.id)
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Exception fixing database inconsistencies:', error);
      return false;
    }
  }, [user]);

  const validateTimerState = useCallback(async (
    localTimers: Timer[],
    validateAgainstDatabase = true
  ): Promise<ValidationResult> => {
    const errors: string[] = [];
    const runningTimers = localTimers.filter(t => t.isRunning);

    // Basic local validation
    if (runningTimers.length > 1) {
      errors.push(`Multiple running timers detected locally: ${runningTimers.length}`);
    }

    // Check for invalid elapsed times
    const invalidTimers = localTimers.filter(t => t.elapsedTime < 0 || !Number.isFinite(t.elapsedTime));
    if (invalidTimers.length > 0) {
      errors.push(`Invalid elapsed times detected: ${invalidTimers.map(t => t.name).join(', ')}`);
    }

    let databaseInconsistencies;
    let correctedTimers = [...localTimers];

    if (validateAgainstDatabase) {
      const dbState = await validateDatabaseConsistency();
      
      if (dbState) {
        const dbRunningTimers = dbState.timers.filter(t => t.is_running);
        const localRunningIds = runningTimers.map(t => t.id);
        const dbRunningIds = dbRunningTimers.map(t => t.id);

        databaseInconsistencies = {
          runningInDatabase: dbRunningIds,
          stoppedInDatabase: dbState.timers.filter(t => !t.is_running).map(t => t.id),
          multipleRunning: dbState.hasMultipleRunning
        };

        // Check for mismatches between local and database state
        const localOnlyRunning = localRunningIds.filter(id => !dbRunningIds.includes(id));
        const dbOnlyRunning = dbRunningIds.filter(id => !localRunningIds.includes(id));

        if (localOnlyRunning.length > 0) {
          errors.push(`Timers running locally but stopped in database: ${localOnlyRunning.join(', ')}`);
          
          // Correct local state to match database
          correctedTimers = correctedTimers.map(timer => 
            localOnlyRunning.includes(timer.id) 
              ? { ...timer, isRunning: false }
              : timer
          );
        }

        if (dbOnlyRunning.length > 0) {
          errors.push(`Timers running in database but stopped locally: ${dbOnlyRunning.join(', ')}`);
          
          // Correct local state to match database
          correctedTimers = correctedTimers.map(timer => 
            dbOnlyRunning.includes(timer.id) 
              ? { ...timer, isRunning: true }
              : timer
          );
        }

        if (dbState.hasMultipleRunning) {
          errors.push(`Multiple timers running in database: ${dbRunningIds.length}`);
        }
      }
    }

    const isValid = errors.length === 0;

    if (!isValid) {
      console.warn('⚠️ Timer state validation failed:', errors);
    }

    return {
      isValid,
      errors,
      correctedTimers: isValid ? undefined : correctedTimers,
      databaseInconsistencies
    };
  }, [validateDatabaseConsistency]);

  const autoCorrectTimerState = useCallback(async (timers: Timer[]): Promise<Timer[]> => {
    console.log('🔧 Auto-correcting timer state...');
    
    const validation = await validateTimerState(timers, true);
    
    if (validation.isValid) {
      console.log('✅ Timer state is already valid');
      return timers;
    }

    // Fix database inconsistencies first
    if (validation.databaseInconsistencies?.multipleRunning) {
      const runningTimers = timers.filter(t => t.isRunning);
      const timerToKeep = runningTimers[0]?.id; // Keep the first running timer
      await fixDatabaseInconsistencies(timerToKeep);
    }

    const correctedTimers = validation.correctedTimers || timers;
    
    console.log('✅ Timer state auto-corrected:', {
      originalRunning: timers.filter(t => t.isRunning).length,
      correctedRunning: correctedTimers.filter(t => t.isRunning).length,
      errors: validation.errors
    });

    return correctedTimers;
  }, [validateTimerState, fixDatabaseInconsistencies]);

  return {
    validateTimerState,
    validateDatabaseConsistency,
    fixDatabaseInconsistencies,
    autoCorrectTimerState
  };
};