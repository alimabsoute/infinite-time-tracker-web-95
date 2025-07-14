
import EmptyState from "../EmptyState";

interface EmptyTimerStateProps {
  onCreateTimer?: () => void;
}

const EmptyTimerState = ({ onCreateTimer }: EmptyTimerStateProps) => {
  console.log('🚫 EmptyTimerState - Rendering empty state', { hasCreateFunction: !!onCreateTimer });
  
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-blue-50 border-2 border-blue-200 rounded-lg">
      {/* Debug indicator */}
      <div className="absolute top-4 left-4 bg-purple-500 text-white text-xs px-2 py-1 rounded">
        EMPTY STATE ACTIVE
      </div>
      <EmptyState 
        type="timers" 
        onCreateTimer={onCreateTimer}
        showCreateButton={!!onCreateTimer}
      />
    </div>
  );
};

export default EmptyTimerState;
