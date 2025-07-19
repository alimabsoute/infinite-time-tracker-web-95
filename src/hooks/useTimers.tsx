
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "./useNotifications";
import { useTimerState } from "./useTimerState";
import { useTimerActions } from "./useTimerActions";
import { useTimerRealtime } from "./useTimerRealtime";
import { useTimerAnimations } from "./useTimerAnimations";
import { useTimerEffectsFixed } from "./useTimerEffectsFixed";
import { useTimerStatePreservation } from "./useTimerStatePreservation";
import { useTimerStateMonitoring } from "./useTimerStateMonitoring";

export const useTimers = () => {
  const { user } = useAuth();
  const { updateTimerData } = useNotifications();
  
  // Core state management with robust persistence
  const { timers, setTimers, loading, timersRef } = useTimerState();
  
  // Animation state management
  const {
    confettiTrigger,
    celebrationTrigger,
    setConfettiTrigger,
    setCelebrationTrigger,
    clearConfettiTrigger,
    clearCelebrationTrigger
  } = useTimerAnimations();

  // Timer effects (auto-save, timer updates, cleanup) - FIXED VERSION
  const { isPageVisibleRef } = useTimerEffectsFixed({ timers, setTimers, timersRef });

  // Timer state preservation (simple save-only approach)
  useTimerStatePreservation({ timersRef, setTimers, isPageVisibleRef });

  // NEW: Comprehensive state monitoring
  useTimerStateMonitoring(timers);

  // Update notification data for running timers
  useEffect(() => {
    timers.forEach(timer => {
      updateTimerData(timer.id, timer.name, timer.elapsedTime, timer.isRunning);
    });
  }, [timers, updateTimerData]);

  // Timer actions
  const timerActions = useTimerActions({ 
    timers, 
    setTimers, 
    setConfettiTrigger, 
    setCelebrationTrigger,
    clearConfettiTrigger 
  });

  // Real-time updates
  useTimerRealtime({ timers, setTimers });

  // Enhanced logging for debugging
  useEffect(() => {
    const runningCount = timers.filter(t => t.isRunning).length;
    if (runningCount > 0) {
      console.log(`🏃 useTimers: ${runningCount} timers running out of ${timers.length} total`);
    }
  }, [timers]);

  return {
    timers,
    loading,
    ...timerActions,
    confettiTrigger,
    celebrationTrigger,
    clearConfettiTrigger,
    clearCelebrationTrigger,
  };
};
