
import { Timer as TimerType } from "../types";
import Timer from "./Timer";

interface TimerListProps {
  timers: TimerType[];
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

const TimerList = ({
  timers,
  onToggle,
  onReset,
  onDelete,
  onRename,
}: TimerListProps) => {
  if (timers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No timers yet. Create your first timer to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {timers.map((timer) => (
        <Timer
          key={timer.id}
          timer={timer}
          onToggle={onToggle}
          onReset={onReset}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </div>
  );
};

export default TimerList;
