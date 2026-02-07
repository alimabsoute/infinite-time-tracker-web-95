
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

      // Expanded pattern matching for mock timers
      const mockTimerPatterns = [
        // Generic numbered patterns
        /^Timer \d+$/,
        /^Task \d+$/,
        /^Project \d+$/,
        /^Meeting \d+$/,
        /^Session \d+$/,
        /^Item \d+$/,
        
        // Work-related patterns
        /^Work Timer$/,
        /^Work Session$/,
        /^Work Task$/,
        /^Daily Work$/,
        /^Office Work$/,
        
        // Study-related patterns
        /^Study Session$/,
        /^Study Timer$/,
        /^Study Time$/,
        /^Learning$/,
        /^Reading$/,
        /^Research$/,
        /^Homework$/,
        
        // Development patterns
        /^Coding$/,
        /^Programming$/,
        /^Development$/,
        /^Debug Session$/,
        /^Code Review$/,
        /^Testing$/,
        
        // Creative patterns
        /^Design Work$/,
        /^Creative Time$/,
        /^Writing$/,
        /^Drawing$/,
        /^Planning$/,
        
        // Generic activities
        /^Exercise$/,
        /^Workout$/,
        /^Break$/,
        /^Lunch$/,
        /^Call$/,
        /^Email$/,
        
        // Mock/Test patterns
        /^Mock Timer/,
        /^Test Timer/,
        /^Sample Timer/,
        /^Demo Timer/,
        /^Example Timer/,
        /^Placeholder/,
        /^Default Timer/,
        
        // Additional common patterns
        /^New Timer$/,
        /^Untitled/,
        /^Quick Timer/,
        /^Focus Time/,
        /^Deep Work/,
        /^Pomodoro/,
        
        // Pattern for very generic single words
        /^(Work|Study|Focus|Break|Meeting|Call|Email|Task|Project)$/,
        
        // Pattern for "Activity + Number" format
        /^(Activity|Action|Goal|Objective) \d+$/,
        
        // Pattern for date-based mock timers
        /^(Today|Tomorrow|Yesterday)/,
        
        // Pattern for time-based mock timers
        /^(Morning|Afternoon|Evening|Night) (Work|Study|Session)/,
      ];

      const mockTimers = timers.filter(timer => 
        mockTimerPatterns.some(pattern => pattern.test(timer.name))
      );

      if (mockTimers.length === 0) {
        toast.info("No mock timers found to clear", {
          description: "All your timers appear to be custom-named"
        });
        return;
      }

      // Show confirmation with timer count
      const confirmed = window.confirm(
        `Are you sure you want to delete ${mockTimers.length} mock timer${mockTimers.length > 1 ? 's' : ''}?\n\n` +
        `This will remove: ${mockTimers.slice(0, 5).map(t => t.name).join(', ')}${mockTimers.length > 5 ? ` and ${mockTimers.length - 5} more...` : ''}\n\n` +
        `This action cannot be undone.`
      );

      if (!confirmed) {
        toast.info("Mock data clearing cancelled");
        return;
      }

      // Delete mock timers in batches
      const batchSize = 50;
      let deletedCount = 0;
      let errorCount = 0;

      for (let i = 0; i < mockTimers.length; i += batchSize) {
        const batch = mockTimers.slice(i, i + batchSize);
        const timerIds = batch.map(t => t.id);

        try {
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
            console.error('Error ending sessions for batch:', sessionError);
          }

          // Mark timers as deleted (soft delete)
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
            errorCount += batch.length;
            toast.error(`Failed to delete some timers in batch ${Math.floor(i / batchSize) + 1}`);
          } else {
            deletedCount += batch.length;
          }
        } catch (batchError) {
          console.error('Batch processing error:', batchError);
          errorCount += batch.length;
        }

        // Add a small delay between batches to avoid overwhelming the database
        if (i + batchSize < mockTimers.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Provide detailed feedback
      if (deletedCount > 0) {
        toast.success(`Successfully cleared ${deletedCount} mock timer${deletedCount > 1 ? 's' : ''}!`, {
          description: `Your timer list has been cleaned up${errorCount > 0 ? `. ${errorCount} timer${errorCount > 1 ? 's' : ''} could not be deleted.` : ''}`
        });
      }

      if (errorCount > 0 && deletedCount === 0) {
        toast.error(`Failed to delete any timers (${errorCount} errors)`, {
          description: "Please try again or contact support if the issue persists"
        });
      }

      // Force a page refresh to ensure UI updates (as a fallback)
      if (deletedCount > 0) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }

    } catch (error) {
      console.error('Error clearing mock data:', error);
      toast.error("Failed to clear mock data", {
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setIsClearing(false);
    }
  };

  // Force clear function for edge cases
  const forceClearAllTimers = async () => {
    if (!user) {
      toast.error("You must be logged in to clear all timers");
      return;
    }

    const confirmed = window.confirm(
      "⚠️ FORCE CLEAR ALL TIMERS ⚠️\n\n" +
      "This will delete ALL your timers, including custom ones.\n" +
      "This action cannot be undone.\n\n" +
      "Are you absolutely sure?"
    );

    if (!confirmed) return;

    setIsClearing(true);

    try {
      const { data: allTimers, error: fetchError } = await supabase
        .from('timers')
        .select('id')
        .is('deleted_at', null);

      if (fetchError) {
        console.error('Error fetching all timers:', fetchError);
        toast.error("Failed to fetch timers");
        return;
      }

      if (!allTimers || allTimers.length === 0) {
        toast.info("No timers to clear");
        return;
      }

      // End all active sessions
      await supabase
        .from('timer_sessions')
        .update({ 
          end_time: new Date().toISOString(),
          duration_ms: 0
        })
        .is('end_time', null);

      // Delete all timers
      const { error: deleteError } = await supabase
        .from('timers')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user.id,
          is_running: false
        })
        .is('deleted_at', null);

      if (deleteError) {
        console.error('Error force clearing all timers:', deleteError);
        toast.error("Failed to clear all timers");
      } else {
        toast.success(`Force cleared ${allTimers.length} timer${allTimers.length > 1 ? 's' : ''}!`);
        setTimeout(() => window.location.reload(), 1500);
      }

    } catch (error) {
      console.error('Error force clearing all data:', error);
      toast.error("Failed to force clear all data");
    } finally {
      setIsClearing(false);
    }
  };

  return {
    clearMockTimers,
    forceClearAllTimers,
    isClearing
  };
};
