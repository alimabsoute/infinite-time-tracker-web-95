import { createClient } from '@supabase/supabase-js';
import { Timer } from '../types';

// Access Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Provide clearer error messages if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are not defined!', {
    url: supabaseUrl ? 'defined' : 'missing',
    key: supabaseAnonKey ? 'defined' : 'missing'
  });
  console.warn('Please make sure you have connected your project to Supabase in the Lovable interface and set up the environment variables.');
}

// Create the Supabase client with proper type checking
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', // This ensures the client initializes, but won't work without real values
  supabaseAnonKey || 'placeholder-key'
);

// Timers table helper functions
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
    return data.map((record: any): Timer => ({
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

export const createTimer = async (timer: Timer) => {
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
  });

  if (error) {
    console.error('Error creating timer:', error);
    return false;
  }
  return true;
};

export const updateTimer = async (timer: Timer) => {
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
export const subscribeToTimers = (callback: (timers: Timer[]) => void) => {
  const subscription = supabase
    .channel('timers_channel')
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
    supabase.removeChannel(subscription);
  };
};

// Auth helper functions
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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};
