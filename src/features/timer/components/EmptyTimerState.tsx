import EmptyState from "@shared/components/EmptyState";

interface EmptyTimerStateProps {
  onCreateTimer?: () => void;
}

const EmptyTimerState = ({ onCreateTimer }: EmptyTimerStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] border-2 border-dashed border-border rounded-xl">
      <EmptyState
        type="timers"
        onCreateTimer={onCreateTimer}
        showCreateButton={!!onCreateTimer}
      />
    </div>
  );
};

export default EmptyTimerState;
