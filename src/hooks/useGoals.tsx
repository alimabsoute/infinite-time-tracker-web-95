
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Goal, CreateGoalInput, GoalProgress } from '@/types/goals';
import { useToast } from '@/hooks/use-toast';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGoals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals((data || []) as Goal[]);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch goals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: CreateGoalInput): Promise<Goal | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goalData,
          user_id: user.id,
          start_date: goalData.start_date || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;

      const newGoal = data as Goal;
      setGoals(prev => [newGoal, ...prev]);
      toast({
        title: "Success",
        description: "Goal created successfully!",
      });
      return newGoal;
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>): Promise<Goal | null> => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedGoal = data as Goal;
      setGoals(prev => prev.map(goal => goal.id === id ? updatedGoal : goal));
      toast({
        title: "Success",
        description: "Goal updated successfully!",
      });
      return updatedGoal;
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGoals(prev => prev.filter(goal => goal.id !== id));
      toast({
        title: "Success",
        description: "Goal deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  const updateGoalProgress = async (goalId: string, value: number, date: string = new Date().toISOString().split('T')[0]) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goal_progress')
        .upsert({
          goal_id: goalId,
          user_id: user.id,
          date,
          value,
        })
        .select()
        .single();

      if (error) throw error;

      // Update the current_value in the goal
      await updateGoal(goalId, { current_value: value });
      
      return data;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      toast({
        title: "Error",
        description: "Failed to update goal progress",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    refetch: fetchGoals,
  };
};
