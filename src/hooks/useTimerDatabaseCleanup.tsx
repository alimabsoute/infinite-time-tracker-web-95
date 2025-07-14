import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export const useTimerDatabaseCleanup = () => {
  const { user } = useAuth();

  const auditDatabaseState = useCallback(async () => {
    if (!user) return null;

    console.log('🔍 [DATABASE AUDIT] Starting comprehensive database state audit...');
    
    try {
      // Query all timers for the user
      const { data: timers, error } = await supabase
        .from('timers')
        .select('id, name, is_running, elapsed_time, created_at')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [DATABASE AUDIT] Error querying timers:', error);
        return null;
      }

      const runningTimers = timers?.filter(t => t.is_running) || [];
      const stoppedTimers = timers?.filter(t => !t.is_running) || [];

      console.log('📊 [DATABASE AUDIT] Results:', {
        totalTimers: timers?.length || 0,
        runningTimers: runningTimers.length,
        stoppedTimers: stoppedTimers.length,
        runningTimerIds: runningTimers.map(t => t.id),
        details: timers?.map(t => ({
          id: t.id,
          name: t.name,
          isRunning: t.is_running,
          elapsedTime: t.elapsed_time
        }))
      });

      return {
        allTimers: timers || [],
        runningTimers,
        stoppedTimers,
        hasMultipleRunning: runningTimers.length > 1
      };
    } catch (error) {
      console.error('❌ [DATABASE AUDIT] Unexpected error:', error);
      return null;
    }
  }, [user]);

  const stopAllRunningTimers = useCallback(async (reason = 'cleanup') => {
    if (!user) return { success: false, error: 'No user' };

    console.log(`🛑 [DATABASE CLEANUP] Stopping all running timers (reason: ${reason})`);
    
    try {
      // First, audit current state
      const auditResult = await auditDatabaseState();
      if (!auditResult) return { success: false, error: 'Failed to audit database' };

      if (auditResult.runningTimers.length === 0) {
        console.log('✅ [DATABASE CLEANUP] No running timers found, nothing to clean');
        return { success: true, stoppedCount: 0 };
      }

      // Stop all running timers in database
      const { error: updateError, count } = await supabase
        .from('timers')
        .update({ is_running: false })
        .eq('user_id', user.id)
        .eq('is_running', true)
        .is('deleted_at', null);

      if (updateError) {
        console.error('❌ [DATABASE CLEANUP] Error stopping timers:', updateError);
        return { success: false, error: updateError.message };
      }

      console.log(`✅ [DATABASE CLEANUP] Successfully stopped ${count || 0} running timers`);
      
      // Re-audit to verify cleanup
      const postCleanupAudit = await auditDatabaseState();
      const stillRunning = postCleanupAudit?.runningTimers.length || 0;
      
      if (stillRunning > 0) {
        console.warn(`⚠️ [DATABASE CLEANUP] Warning: ${stillRunning} timers still running after cleanup`);
      }

      return { 
        success: true, 
        stoppedCount: count || 0,
        beforeCleanup: auditResult.runningTimers.length,
        afterCleanup: stillRunning
      };
    } catch (error) {
      console.error('❌ [DATABASE CLEANUP] Unexpected error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [user, auditDatabaseState]);

  const ensureSingleRunningTimer = useCallback(async (keepRunningTimerId?: string) => {
    if (!user) return { success: false, error: 'No user' };

    console.log(`🎯 [DATABASE CONSISTENCY] Ensuring only one timer is running (keep: ${keepRunningTimerId || 'none'})`);
    
    try {
      const auditResult = await auditDatabaseState();
      if (!auditResult) return { success: false, error: 'Failed to audit database' };

      if (auditResult.runningTimers.length <= 1) {
        console.log('✅ [DATABASE CONSISTENCY] Database already consistent (≤1 running timer)');
        return { success: true, changesMade: false };
      }

      let updateQuery = supabase
        .from('timers')
        .update({ is_running: false })
        .eq('user_id', user.id)
        .eq('is_running', true)
        .is('deleted_at', null);

      // If we want to keep one timer running, exclude it
      if (keepRunningTimerId) {
        updateQuery = updateQuery.neq('id', keepRunningTimerId);
      }

      const { error: updateError, count } = await updateQuery;

      if (updateError) {
        console.error('❌ [DATABASE CONSISTENCY] Error updating timers:', updateError);
        return { success: false, error: updateError.message };
      }

      console.log(`✅ [DATABASE CONSISTENCY] Stopped ${count || 0} conflicting timers`);
      
      // Verify the result
      const postUpdateAudit = await auditDatabaseState();
      const runningCount = postUpdateAudit?.runningTimers.length || 0;
      
      return { 
        success: true, 
        changesMade: (count || 0) > 0,
        stoppedCount: count || 0,
        finalRunningCount: runningCount
      };
    } catch (error) {
      console.error('❌ [DATABASE CONSISTENCY] Unexpected error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [user, auditDatabaseState]);

  return {
    auditDatabaseState,
    stopAllRunningTimers,
    ensureSingleRunningTimer
  };
};
