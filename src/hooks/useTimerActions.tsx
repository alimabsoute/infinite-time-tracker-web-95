
import { Timer } from '../types';
import { useTimerCreation } from './useTimerCreation';
import { useTimerOperations } from './useTimerOperations';
import { useTimerCrud } from './useTimerCrud';

interface UseTimerActionsProps {
  timers: Timer[];
  setTimers: React.Dispatch<React.SetStateAction<Timer[]>>;
  setConfettiTrigger: React.Dispatch<React.SetStateAction<{ x: number; y: number; id: string } | null>>;
  clearConfettiTrigger: () => void;
}

export const useTimerActions = ({ 
  timers, 
  setTimers, 
  setConfettiTrigger, 
  clearConfettiTrigger 
}: UseTimerActionsProps) => {
  // Timer creation functionality
  const { addTimer } = useTimerCreation({
    timers,
    setTimers,
    setConfettiTrigger,
    clearConfettiTrigger
  });

  // Timer operations (toggle, reset, delete)
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
