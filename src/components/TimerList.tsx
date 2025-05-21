
import { Timer as TimerType } from "../types";
import Timer from "./Timer";

interface TimerListProps {
  timers: TimerType[];
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  newTimerId: string | null;
}

const TimerList = ({
  timers,
  onToggle,
  onReset,
  onDelete,
  onRename,
  newTimerId,
}: TimerListProps) => {
  if (timers.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 text-lg">
        <p>No timers yet. Tap the + button to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 justify-items-center p-4">
      {timers.map((timer) => (
        <Timer
          key={timer.id}
          timer={timer}
          onToggle={onToggle}
          onReset={onReset}
          onDelete={onDelete}
          onRename={onRename}
          isNew={timer.id === newTimerId}
        />
      ))}
    </div>
  );
};

export default TimerList;
