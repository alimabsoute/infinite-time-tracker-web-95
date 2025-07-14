
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "./useNotifications";
import { useTimerState } from "./useTimerState";
import { useTimerActions } from "./useTimerActions";
import { useTimerRealtime } from "./useTimerRealtime";
import { useTimerAnimations } from "./useTimerAnimations";
import { useTimerEffectsFixed } from "./useTimerEffectsFixed";
import { useTimerBrowserEventsFixed } from "./useTimerBrowserEventsFixed";
import { useTimerMonitoring } from "./useTimerMonitoring";

export const useTimers = () => {
  const { user } = useAuth();
  const { updateTimerData } = useNotifications();
  
  // Core state management
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

  // Browser events handling (visibility, focus, blur, etc.) - FIXED VERSION
  useTimerBrowserEventsFixed({ timersRef, setTimers, isPageVisibleRef });

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
  
  // Monitoring and debugging
  useTimerMonitoring(timers);

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
