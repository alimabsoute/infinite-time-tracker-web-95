
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useClearMockData = () => {
  const [isClearing, setIsClearing] = useState(false);
  const { user } = useAuth();

  const clearMockTimers = async () => {
    if (!user) {
      toast.error("You must be logged in to clear mock data");
      return;
    }

    setIsClearing(true);
    
    try {
      // First, get all timers for the current user
      const { data: timers, error: fetchError } = await supabase
        .from('timers')
        .select('id, name')
        .is('deleted_at', null);

      if (fetchError) {
        console.error('Error fetching timers:', fetchError);
        toast.error("Failed to fetch timers");
        return;
      }

      if (!timers || timers.length === 0) {
        toast.success("No timers to clear");
        return;
      }

      // Identify mock timers (those with generic names or patterns)
      const mockTimerPatterns = [
        /^Timer \d+$/,
        /^Work Timer$/,
        /^Study Session$/,
        /^Project \w+$/,
        /^Task \d+$/,
        /^Meeting \d+$/,
        /^Exercise$/,
        /^Reading$/,
        /^Coding$/,
        /^Design Work$/,
        /^Research$/,
        /^Writing$/,
        /^Mock Timer/,
        /^Test Timer/,
        /^Sample Timer/,
        /^Demo Timer/,
        /^Example Timer/
      ];

      const mockTimers = timers.filter(timer => 
        mockTimerPatterns.some(pattern => pattern.test(timer.name))
      );

      if (mockTimers.length === 0) {
        toast.success("No mock timers found to clear");
        return;
      }

      console.log(`Found ${mockTimers.length} mock timers to delete:`, mockTimers.map(t => t.name));

      // Delete mock timers in batches
      const batchSize = 50;
      let deletedCount = 0;

      for (let i = 0; i < mockTimers.length; i += batchSize) {
        const batch = mockTimers.slice(i, i + batchSize);
        const timerIds = batch.map(t => t.id);

        // First, end any active sessions for these timers
        const { error: sessionError } = await supabase
          .from('timer_sessions')
          .update({ 
            end_time: new Date().toISOString(),
            duration_ms: 0
          })
          .in('timer_id', timerIds)
          .is('end_time', null);

        if (sessionError) {
          console.error('Error ending sessions:', sessionError);
        }

        // Mark timers as deleted
        const { error: deleteError } = await supabase
          .from('timers')
          .update({
            deleted_at: new Date().toISOString(),
            deleted_by: user.id,
            is_running: false
          })
          .in('id', timerIds);

        if (deleteError) {
          console.error('Error deleting timer batch:', deleteError);
          toast.error(`Failed to delete some timers: ${deleteError.message}`);
        } else {
          deletedCount += batch.length;
          console.log(`Deleted batch of ${batch.length} timers`);
        }
      }

      if (deletedCount > 0) {
        toast.success(`Successfully cleared ${deletedCount} mock timers!`, {
          description: "Your timer list has been cleaned up"
        });
      }

    } catch (error) {
      console.error('Error clearing mock data:', error);
      toast.error("Failed to clear mock data");
    } finally {
      setIsClearing(false);
    }
  };

  return {
    clearMockTimers,
    isClearing
  };
};
