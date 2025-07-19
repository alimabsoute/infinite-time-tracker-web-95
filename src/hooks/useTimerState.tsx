
import { useState, useEffect, useRef } from 'react';
import { Timer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useRunningTimerPersistence } from './useRunningTimerPersistence';
import { useTimerPersistenceEnhanced } from './useTimerPersistenceEnhanced';
import { useTimerSync } from './useTimerSync';
import { toast } from 'sonner';

export const useTimerState = () => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { saveRunningTimers, loadRunningTimers, clearRunningTimers } = useRunningTimerPersistence();
  const { 
    saveEnhancedTimerState, 
    loadEnhancedTimerState, 
    clearEnhancedTimerState,
    restoreEnhancedTimerElapsedTime 
  } = useTimerPersistenceEnhanced();
  const { batchSyncTimers } = useTimerSync();

  // Refs for tracking state
  const timersRef = useRef<Timer[]>([]);
  const hasLoadedRef = useRef(false);

  // Update timers ref when timers change
  useEffect(() => {
    timersRef.current = timers;
  }, [timers]);

  // Load timers from Supabase on initial render and when user changes
  useEffect(() => {
    if (!user) {
      setTimers([]);
      setLoading(false);
      clearRunningTimers();
      clearEnhancedTimerState();
      hasLoadedRef.current = false;
      return;
    }

    // Prevent multiple loads
    if (hasLoadedRef.current) {
      console.log('⏭️ Skipping timer load - already loaded for this session');
      return;
    }

    const loadTimers = async () => {
      try {
        setLoading(true);
        console.log('🔄 Loading timers from database with enhanced restoration...');
        
        const { data, error } = await supabase
          .from('timers')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error loading timers:", error);
          toast.error("Failed to load timers");
          setTimers([]);
          return;
        }

        // Load enhanced persistence data FIRST
        const enhancedPersistenceData = loadEnhancedTimerState();
        const persistedRunningIds = loadRunningTimers();
        
        console.log('🔒 ENHANCED LOADING: Using local persistence for running states');
        console.log(`📋 Persisted running timer IDs:`, persistedRunningIds);
        
        const currentTime = Date.now();
        
        const processedTimers = data.map(timer => {
          const shouldBeRunning = persistedRunningIds.includes(timer.id);
          
          // For running timers, calculate current elapsed time using session data
          let calculatedElapsedTime = timer.elapsed_time;
          
          if (shouldBeRunning && enhancedPersistenceData) {
            const savedTimer = enhancedPersistenceData.timers.find(saved => saved.id === timer.id);
            if (savedTimer) {
              // Calculate time since last snapshot
              const timeSinceSnapshot = currentTime - savedTimer.snapshotTime;
              // Use saved elapsed time + time since snapshot
              calculatedElapsedTime = Math.max(
                timer.elapsed_time, // Never go below database value
                savedTimer.elapsedTime + (timeSinceSnapshot > 0 ? timeSinceSnapshot : 0)
              );
              console.log(`⏱️ Calculated elapsed time for ${timer.name}:`, {
                database: timer.elapsed_time,
                saved: savedTimer.elapsedTime,
                timeSince: timeSinceSnapshot,
                calculated: calculatedElapsedTime
              });
            }
          }
          
          return {
            id: timer.id,
            name: timer.name,
            elapsedTime: calculatedElapsedTime,
            isRunning: shouldBeRunning, // ONLY use local persistence
            createdAt: new Date(timer.created_at),
            deadline: timer.deadline ? new Date(timer.deadline) : undefined,
            category: timer.category || undefined,
            tags: timer.tags || undefined,
            priority: timer.priority || undefined,
            currentSessionId: undefined,
            sessionStartTime: undefined,
          };
        });
        
        // Find any open sessions for the loaded timers
        const runningTimerIds = processedTimers.filter(t => t.isRunning).map(t => t.id);
        if (runningTimerIds.length > 0) {
          console.log(`🔍 Loading sessions for ${runningTimerIds.length} running timers`);
          const { data: openSessions, error: sessionError } = await (supabase
            .from('timer_sessions') as any)
            .select('*')
            .in('timer_id', runningTimerIds)
            .is('end_time', null);

          if (sessionError) {
            console.error("Error fetching open sessions:", sessionError);
          } else if (openSessions) {
            processedTimers.forEach(timer => {
              const openSession = openSessions.find((s: any) => s.timer_id === timer.id);
              if (openSession) {
                timer.currentSessionId = openSession.id;
                timer.sessionStartTime = new Date(openSession.start_time);
              }
            });
          }
        }

        // Apply enhanced restoration if available
        let finalTimers = processedTimers;
        if (enhancedPersistenceData) {
          finalTimers = restoreEnhancedTimerElapsedTime(processedTimers, enhancedPersistenceData);
        }
        
        console.log(`✅ Loaded ${finalTimers.length} timers with ${runningTimerIds.length} running (enhanced restoration applied)`);
        setTimers(finalTimers);
        hasLoadedRef.current = true;
        
      } catch (error) {
        console.error("Error loading timers:", error);
        toast.error("Failed to load timers");
      } finally {
        setLoading(false);
      }
    };

    loadTimers();
  }, [user, loadRunningTimers, clearRunningTimers, clearEnhancedTimerState, loadEnhancedTimerState, restoreEnhancedTimerElapsedTime]);

  // Enhanced auto-save for both simple and enhanced persistence
  useEffect(() => {
    if (!hasLoadedRef.current) return; // Don't save until we've loaded
    
    const runningTimers = timers
      .filter(t => t.isRunning)
      .map(t => ({ id: t.id, name: t.name }));
    
    // Save to simple persistence (for backward compatibility)
    saveRunningTimers(runningTimers);
    
    // Save to enhanced persistence (for better restoration)
    saveEnhancedTimerState(timers, 'auto-save');
  }, [timers, saveRunningTimers, saveEnhancedTimerState]);

  return {
    timers,
    setTimers,
    loading,
    timersRef
  };
};
