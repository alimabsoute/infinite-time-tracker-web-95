
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useGoals } from './useGoals';
import { Goal } from '@/types/goals';
import { useToast } from '@/hooks/use-toast';

export const useGoalProgressAutomation = () => {
  const { user } = useAuth();
  const { goals, updateGoal, updateGoalProgress } = useGoals();
  const { toast } = useToast();

  const calculateProgressFromTimers = useCallback(async (goal: Goal) => {
    if (!user || !goal.timer_ids || goal.timer_ids.length === 0) return;

    try {
      // Get all timer sessions for the goal's timers within the goal's time range
      const { data: sessions, error } = await supabase
        .from('timer_sessions')
        .select('duration_ms, start_time')
        .in('timer_id', goal.timer_ids)
        .gte('start_time', goal.start_date)
        .eq('user_id', user.id)
        .not('end_time', 'is', null);

      if (error) {
        console.error('Error fetching timer sessions:', error);
        return;
      }

      if (!sessions) return;

      let totalProgress = 0;

      switch (goal.type) {
        case 'time_based':
          // Sum up all session durations
          totalProgress = sessions.reduce((sum, session) => {
            return sum + (session.duration_ms || 0);
          }, 0);
          
          // Convert to the goal's unit
          if (goal.unit === 'hours') {
            totalProgress = Math.floor(totalProgress / (1000 * 60 * 60));
          } else if (goal.unit === 'minutes') {
            totalProgress = Math.floor(totalProgress / (1000 * 60));
          }
          break;

        case 'session_count':
          // Count the number of sessions
          totalProgress = sessions.length;
          break;

        case 'streak':
          // Calculate streak based on consecutive days with sessions
          const sessionDates = sessions.map(s => new Date(s.start_time).toDateString());
          const uniqueDates = [...new Set(sessionDates)].sort();
          
          let currentStreak = 0;
          let maxStreak = 0;
          let previousDate = null;

          for (const dateStr of uniqueDates) {
            const currentDate = new Date(dateStr);
            
            if (previousDate) {
              const dayDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
              if (dayDiff === 1) {
                currentStreak++;
              } else {
                maxStreak = Math.max(maxStreak, currentStreak);
                currentStreak = 1;
              }
            } else {
              currentStreak = 1;
            }
            
            previousDate = currentDate;
          }
          
          totalProgress = Math.max(maxStreak, currentStreak);
          break;

        case 'deadline':
          // For deadline goals, progress is based on completion percentage
          const totalDuration = sessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0);
          
          if (goal.unit === 'hours') {
            totalProgress = Math.floor(totalDuration / (1000 * 60 * 60));
          } else if (goal.unit === 'minutes') {
            totalProgress = Math.floor(totalDuration / (1000 * 60));
          } else {
            totalProgress = sessions.length;
          }
          break;
      }

      // Update the goal's current value if it has changed
      if (totalProgress !== goal.current_value) {
        await updateGoal(goal.id, { current_value: totalProgress });
        
        // Also update the goal progress record for today
        const today = new Date().toISOString().split('T')[0];
        await updateGoalProgress(goal.id, totalProgress, today);

        // Check if goal is completed
        if (totalProgress >= goal.target_value && goal.status !== 'completed') {
          await updateGoal(goal.id, { 
            status: 'completed',
            completed_at: new Date().toISOString()
          });
          
          toast({
            title: "🎉 Goal Completed!",
            description: `Congratulations! You've achieved your goal: ${goal.title}`,
          });
        }
      }
    } catch (error) {
      console.error('Error calculating goal progress:', error);
    }
  }, [user, updateGoal, updateGoalProgress, toast]);

  const updateAllGoalProgress = useCallback(async () => {
    const activeGoals = goals.filter(goal => 
      goal.status === 'active' && 
      goal.timer_ids && 
      goal.timer_ids.length > 0
    );

    for (const goal of activeGoals) {
      await calculateProgressFromTimers(goal);
    }
  }, [goals, calculateProgressFromTimers]);

  // Subscribe to timer session changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('timer_sessions_automation')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'timer_sessions',
          filter: `user_id=eq.${user.id}`
        }, 
        async (payload) => {
          console.log('Timer session change detected, updating goal progress...');
          // Small delay to ensure the session is fully written
          setTimeout(() => {
            updateAllGoalProgress();
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, updateAllGoalProgress]);

  // Update progress when goals change or component mounts
  useEffect(() => {
    if (goals.length > 0) {
      updateAllGoalProgress();
    }
  }, [goals.length, updateAllGoalProgress]);

  return {
    updateAllGoalProgress,
    calculateProgressFromTimers
  };
};
