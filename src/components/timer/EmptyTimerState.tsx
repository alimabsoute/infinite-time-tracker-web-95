
import EmptyState from "../EmptyState";

interface EmptyTimerStateProps {
  onCreateTimer?: () => void;
}

const EmptyTimerState = ({ onCreateTimer }: EmptyTimerStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <EmptyState 
        type="timers" 
        onCreateTimer={onCreateTimer}
        showCreateButton={!!onCreateTimer}
      />
    </div>
  );
};

export default EmptyTimerState;
