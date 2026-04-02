
import { Timer as TimerType } from "../types";
import EmptyTimerState from "./EmptyTimerState";
import DraggableTimerGrid from "./DraggableTimerGrid";

interface TimerListProps {
  timers: TimerType[];
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string, category?: string) => void;
  onUpdateDeadline: (id: string, deadline: Date | undefined) => void;
  onUpdatePriority: (id: string, priority: number | undefined) => void;
  onReorder: (reorderedTimers: TimerType[]) => void;
  calculateSessionElapsedTime: (timer: TimerType) => number;
  newTimerId: string | null;
  onCreateTimer?: () => void;
}

const TimerList = ({
  timers,
  onToggle,
  onReset,
  onDelete,
  onRename,
  onUpdateDeadline,
  onUpdatePriority,
  onReorder,
  calculateSessionElapsedTime,
  newTimerId,
  onCreateTimer,
}: TimerListProps) => {
  if (timers.length === 0) {
    return <EmptyTimerState onCreateTimer={onCreateTimer} />;
  }

  return (
    <DraggableTimerGrid
      timers={timers}
      onToggle={onToggle}
      onReset={onReset}
      onDelete={onDelete}
      onRename={onRename}
      onUpdateDeadline={onUpdateDeadline}
      onUpdatePriority={onUpdatePriority}
      onReorder={onReorder}
      calculateSessionElapsedTime={calculateSessionElapsedTime}
      newTimerId={newTimerId}
    />
  );
};

export default TimerList;
