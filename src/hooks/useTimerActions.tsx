
import { Timer } from '../types';
import { useTimerCreation } from './useTimerCreation';
import { useTimerOperations } from './useTimerOperations';
import { useTimerCrud } from './useTimerCrud';

interface UseTimerActionsProps {
  timers: Timer[];
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
  setConfettiTrigger: React.Dispatch<React.SetStateAction<{ x: number; y: number; id: string } | null>>;
  setCelebrationTrigger: React.Dispatch<React.SetStateAction<{ type: 'fireworks' | 'sparkles' | 'balloons' | 'animals' | null }>>;
  clearConfettiTrigger: () => void;
}

export const useTimerActions = ({ 
  timers, 
  setTimers, 
  setConfettiTrigger, 
  setCelebrationTrigger,
  clearConfettiTrigger 
}: UseTimerActionsProps) => {
  // Timer creation functionality with enhanced animations
  const { addTimer } = useTimerCreation({
    timers,
    setTimers,
    setConfettiTrigger,
    setCelebrationTrigger,
    clearConfettiTrigger
  });

  // Timer operations (toggle, reset, delete) with enhanced animations
  const { toggleTimer, resetTimer, deleteTimer } = useTimerOperations({
    timers,
    setTimers
  });

  // Timer CRUD operations (rename, update metadata, reorder)
  const { renameTimer, updateDeadline, updatePriority, reorderTimers } = useTimerCrud({
    timers,
    setTimers
  });

  return {
    addTimer,
    toggleTimer,
    resetTimer,
    deleteTimer,
    renameTimer,
    updateDeadline,
    updatePriority,
    reorderTimers
  };
};
