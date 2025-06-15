
import { useCallback, useRef } from 'react';
import { Timer } from '../types';
import { supabase } from '@/integrations/supabase/client';

export const useTimerSync = () => {
  const lastSyncTimeRef = useRef<{ [timerId: string]: number }>({});
  const syncThrottleMs = 5000; // Sync every 5 seconds max per timer

  const syncTimerToDatabase = useCallback(async (timer: Timer, force = false) => {
    const now = Date.now();
    const lastSync = lastSyncTimeRef.current[timer.id] || 0;
    
    // Throttle syncs unless forced
    if (!force && now - lastSync < syncThrottleMs) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('timers')
        .update({
          elapsed_time: timer.elapsedTime,
          is_running: timer.isRunning
        })
        .eq('id', timer.id);

      if (error) {
        console.error(`❌ Failed to sync timer ${timer.id}:`, error);
        return false;
      }

      lastSyncTimeRef.current[timer.id] = now;
      console.log(`✅ Synced timer ${timer.id} to database`);
      return true;
    } catch (error) {
      console.error(`❌ Exception syncing timer ${timer.id}:`, error);
      return false;
    }
  }, []);

  const batchSyncTimers = useCallback(async (timers: Timer[], force = false) => {
    const runningTimers = timers.filter(timer => timer.isRunning);
    
    if (runningTimers.length === 0) return;

    console.log(`🔄 Batch syncing ${runningTimers.length} running timers...`);
    
    const syncPromises = runningTimers.map(timer => 
      syncTimerToDatabase(timer, force)
    );

    try {
      const results = await Promise.allSettled(syncPromises);
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value === true
      ).length;
      
      console.log(`✅ Batch sync complete: ${successful}/${runningTimers.length} successful`);
    } catch (error) {
      console.error('❌ Batch sync failed:', error);
    }
  }, [syncTimerToDatabase]);

  return {
    syncTimerToDatabase,
    batchSyncTimers
  };
};
