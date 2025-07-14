import { useCallback } from 'react';
import { useTimerDatabaseCleanup } from './useTimerDatabaseCleanup';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const useTimerTesting = () => {
  const { user } = useAuth();
  const { auditDatabaseState, stopAllRunningTimers, ensureSingleRunningTimer } = useTimerDatabaseCleanup();

  const runPhase1DatabaseAudit = useCallback(async () => {
    console.log('🧪 [TESTING] PHASE 1: Database State Audit & Cleanup');
    console.log('='.repeat(50));
    
    if (!user) {
      console.error('❌ [TESTING] No user found for testing');
      toast.error('Please log in to run tests');
      return false;
    }

    try {
      // Step 1: Initial audit
      console.log('📊 [TESTING] Step 1: Initial database audit');
      const initialAudit = await auditDatabaseState();
      if (!initialAudit) {
        console.error('❌ [TESTING] Initial audit failed');
        return false;
      }

      console.log('📋 [TESTING] Initial State Report:', {
        totalTimers: initialAudit.allTimers.length,
        runningTimers: initialAudit.runningTimers.length,
        stoppedTimers: initialAudit.stoppedTimers.length,
        hasMultipleRunning: initialAudit.hasMultipleRunning,
        runningTimerIds: initialAudit.runningTimers.map(t => t.id),
        runningTimerNames: initialAudit.runningTimers.map(t => t.name)
      });

      // Step 2: Cleanup if needed
      if (initialAudit.hasMultipleRunning) {
        console.log('🛠️ [TESTING] Step 2: Cleaning up multiple running timers');
        const cleanupResult = await stopAllRunningTimers('testing-cleanup');
        if (cleanupResult.success) {
          console.log('✅ [TESTING] Cleanup successful:', {
            stoppedCount: cleanupResult.stoppedCount,
            beforeCleanup: cleanupResult.beforeCleanup,
            afterCleanup: cleanupResult.afterCleanup
          });
        } else {
          console.error('❌ [TESTING] Cleanup failed:', cleanupResult.error);
          return false;
        }

        // Step 3: Verify cleanup
        console.log('🔍 [TESTING] Step 3: Verifying cleanup');
        const postCleanupAudit = await auditDatabaseState();
        if (postCleanupAudit) {
          console.log('📋 [TESTING] Post-cleanup Report:', {
            runningTimers: postCleanupAudit.runningTimers.length,
            shouldBeZero: postCleanupAudit.runningTimers.length === 0
          });
          
          if (postCleanupAudit.runningTimers.length === 0) {
            console.log('✅ [TESTING] Database cleanup verified - no running timers');
            toast.success('Phase 1 Complete', { description: 'Database cleaned and verified' });
          } else {
            console.error('❌ [TESTING] Database cleanup failed - timers still running');
            toast.error('Phase 1 Failed', { description: 'Cleanup verification failed' });
            return false;
          }
        }
      } else {
        console.log('✅ [TESTING] Database already consistent - no cleanup needed');
        toast.success('Phase 1 Complete', { description: 'Database already consistent' });
      }

      console.log('🏁 [TESTING] PHASE 1 COMPLETE');
      console.log('='.repeat(50));
      return true;
    } catch (error) {
      console.error('❌ [TESTING] Phase 1 failed with error:', error);
      toast.error('Phase 1 Failed', { description: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }, [user, auditDatabaseState, stopAllRunningTimers]);

  const runTimerCreationTest = useCallback(async (timerName: string, addTimerFn: (name: string) => Promise<string>) => {
    console.log('🧪 [TESTING] Timer Creation Test');
    console.log('='.repeat(40));
    
    try {
      // Pre-creation audit
      console.log('📊 [TESTING] Pre-creation audit');
      const preAudit = await auditDatabaseState();
      if (preAudit) {
        console.log('📋 [TESTING] Pre-creation state:', {
          totalTimers: preAudit.allTimers.length,
          runningTimers: preAudit.runningTimers.length
        });
      }

      // Create timer
      console.log(`➕ [TESTING] Creating timer: "${timerName}"`);
      const timerId = await addTimerFn(timerName);
      if (!timerId) {
        console.error('❌ [TESTING] Timer creation failed');
        return false;
      }
      console.log('✅ [TESTING] Timer created with ID:', timerId);

      // Post-creation audit
      console.log('📊 [TESTING] Post-creation audit');
      const postAudit = await auditDatabaseState();
      if (postAudit) {
        console.log('📋 [TESTING] Post-creation state:', {
          totalTimers: postAudit.allTimers.length,
          runningTimers: postAudit.runningTimers.length,
          newTimerRunning: postAudit.runningTimers.some(t => t.id === timerId),
          multipleRunning: postAudit.hasMultipleRunning
        });

        // Verify expectations
        const expectedRunningCount = 1;
        const actualRunningCount = postAudit.runningTimers.length;
        const newTimerIsRunning = postAudit.runningTimers.some(t => t.id === timerId);

        if (actualRunningCount === expectedRunningCount && newTimerIsRunning && !postAudit.hasMultipleRunning) {
          console.log('✅ [TESTING] Timer creation test PASSED');
          toast.success('Timer Creation Test Passed', { 
            description: `Timer "${timerName}" created and running exclusively` 
          });
          return true;
        } else {
          console.error('❌ [TESTING] Timer creation test FAILED:', {
            expectedRunning: expectedRunningCount,
            actualRunning: actualRunningCount,
            newTimerRunning: newTimerIsRunning,
            hasMultipleRunning: postAudit.hasMultipleRunning
          });
          toast.error('Timer Creation Test Failed', { 
            description: 'Database state inconsistent after creation' 
          });
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ [TESTING] Timer creation test failed with error:', error);
      toast.error('Timer Creation Test Failed', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }, [auditDatabaseState]);

  const runNavigationTest = useCallback(async (testDescription: string) => {
    console.log(`🧪 [TESTING] Navigation Test: ${testDescription}`);
    console.log('='.repeat(40));

    try {
      // Pre-navigation audit
      const preAudit = await auditDatabaseState();
      if (preAudit) {
        console.log('📋 [TESTING] Pre-navigation state:', {
          runningTimers: preAudit.runningTimers.length,
          runningIds: preAudit.runningTimers.map(t => t.id)
        });
      }

      // Simulate navigation away (would trigger browser events)
      console.log('🚶 [TESTING] Simulating navigation...');
      toast.info('Navigation Test', { 
        description: `${testDescription} - Check browser events are triggered` 
      });

      // Post-navigation audit (would be done after navigation back)
      console.log('📊 [TESTING] Post-navigation verification needed');
      console.log('⚠️ [TESTING] Manual verification required - check console logs for browser events');
      
      return true;
    } catch (error) {
      console.error('❌ [TESTING] Navigation test failed:', error);
      return false;
    }
  }, [auditDatabaseState]);

  const generateTestReport = useCallback(async () => {
    console.log('📊 [TESTING] Generating comprehensive test report');
    console.log('='.repeat(60));

    try {
      const audit = await auditDatabaseState();
      if (!audit) {
        console.error('❌ [TESTING] Cannot generate report - audit failed');
        return;
      }

      const report = {
        timestamp: new Date().toISOString(),
        user: user?.id || 'unknown',
        databaseState: {
          totalTimers: audit.allTimers.length,
          runningTimers: audit.runningTimers.length,
          stoppedTimers: audit.stoppedTimers.length,
          hasMultipleRunning: audit.hasMultipleRunning,
          isConsistent: audit.runningTimers.length <= 1
        },
        runningTimerDetails: audit.runningTimers.map(t => ({
          id: t.id,
          name: t.name,
          isRunning: t.is_running,
          elapsedTime: t.elapsed_time
        })),
        recommendations: []
      };

      // Add recommendations
      if (audit.hasMultipleRunning) {
        report.recommendations.push('CRITICAL: Multiple timers running - run cleanup');
      }
      if (audit.runningTimers.length === 0) {
        report.recommendations.push('INFO: No running timers - database clean');
      }
      if (audit.runningTimers.length === 1) {
        report.recommendations.push('SUCCESS: Single timer running - state consistent');
      }

      console.log('📋 [TESTING] COMPREHENSIVE TEST REPORT:');
      console.log(JSON.stringify(report, null, 2));

      toast.success('Test Report Generated', { 
        description: `${report.databaseState.totalTimers} timers, ${report.databaseState.runningTimers} running` 
      });

      return report;
    } catch (error) {
      console.error('❌ [TESTING] Report generation failed:', error);
      return null;
    }
  }, [user, auditDatabaseState]);

  return {
    runPhase1DatabaseAudit,
    runTimerCreationTest,
    runNavigationTest,
    generateTestReport
  };
};