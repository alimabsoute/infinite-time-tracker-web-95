
import { useTimerStateRebuild } from './useTimerStateRebuild';
import { useTimerOperationsRebuild } from './useTimerOperationsRebuild';
import { useTimerCreationRebuild } from './useTimerCreationRebuild';
import { useTimerCrud } from './useTimerCrud';
import { useTimerAnimations } from './useTimerAnimations';

export const useTimersRebuild = () => {
  // Core state management
  const { 
    timers, 
    setTimers, 
    loading,
    timersRef,
    calculateSessionElapsedTime,
    reloadTimers
  } = useTimerStateRebuild();

  // Timer operations (start/stop/reset/delete)
  const { toggleTimer, resetTimer, deleteTimer } = useTimerOperationsRebuild({
    timers,
    setTimers,
    calculateSessionElapsedTime,
    reloadTimers
  });

  // Timer creation
  const { addTimer } = useTimerCreationRebuild({
    timers,
    setTimers,
    calculateSessionElapsedTime,
    reloadTimers
  });

  // Timer CRUD operations (rename, update metadata, reorder)
  const { renameTimer, updateDeadline, updatePriority, reorderTimers } = useTimerCrud({
    timers,
    setTimers
  });

  // Animation state management
  const {
    confettiTrigger,
    celebrationTrigger,
    setConfettiTrigger,
    setCelebrationTrigger,
    clearConfettiTrigger,
    clearCelebrationTrigger
  } = useTimerAnimations();

  return {
    timers,
    loading,
    addTimer,
    toggleTimer,
    resetTimer,
    deleteTimer,
    renameTimer,
    updateDeadline,
    updatePriority,
    reorderTimers,
    confettiTrigger,
    celebrationTrigger,
    clearConfettiTrigger,
    clearCelebrationTrigger,
    calculateSessionElapsedTime,
  };
};
