
// This file is deprecated and kept for backward compatibility
// Please use the official Supabase client from @/integrations/supabase/client.ts instead
import { createClient } from '@supabase/supabase-js';
import { supabase as officialClient } from '@/integrations/supabase/client';

// Provide a warning when this module is imported
console.warn('The supabase.ts module is deprecated. Please update your imports to use @/integrations/supabase/client');

// Export the official client
export const supabase = officialClient;

// Re-export helper functions but implemented with the official client
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signUpWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signUp({
    email,
    password,
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

// Helper functions for timers table
export const fetchTimers = async () => {
  try {
    const { data, error } = await supabase
      .from('timers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching timers:', error);
      return [];
    }

    // Transform database records to Timer objects
    return data.map((record: any) => ({
      id: record.id,
      name: record.name,
      elapsedTime: record.elapsed_time,
      isRunning: record.is_running,
      createdAt: new Date(record.created_at),
      category: record.category || undefined,
      tags: record.tags || undefined,
      deadline: record.deadline ? new Date(record.deadline) : undefined,
      priority: record.priority || undefined,
    }));
  } catch (err) {
    console.error('Exception when fetching timers:', err);
    return [];
  }
};

export const createTimer = async (timer: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('User not authenticated');
    return false;
  }
  
  const { error } = await supabase.from('timers').insert({
    id: timer.id,
    name: timer.name,
    elapsed_time: timer.elapsedTime,
    is_running: timer.isRunning,
    created_at: timer.createdAt.toISOString(),
    category: timer.category,
    tags: timer.tags,
    deadline: timer.deadline?.toISOString(),
    priority: timer.priority,
    user_id: user.id // Important: Set the user_id to satisfy RLS policy
  });

  if (error) {
    console.error('Error creating timer:', error);
    return false;
  }
  return true;
};

export const updateTimer = async (timer: any) => {
  const { error } = await supabase
    .from('timers')
    .update({
      name: timer.name,
      elapsed_time: timer.elapsedTime,
      is_running: timer.isRunning,
      category: timer.category,
      tags: timer.tags,
      deadline: timer.deadline?.toISOString(),
      priority: timer.priority,
    })
    .eq('id', timer.id);

  if (error) {
    console.error('Error updating timer:', error);
    return false;
  }
  return true;
};

export const deleteTimer = async (id: string) => {
  const { error } = await supabase
    .from('timers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting timer:', error);
    return false;
  }
  return true;
};

// Subscribe to timer changes
export const subscribeToTimers = (callback: (timers: any[]) => void) => {
  const channel = supabase
    .channel('timers_changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'timers' 
    }, async () => {
      // When anything changes, fetch the latest timers
      const timers = await fetchTimers();
      callback(timers);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
