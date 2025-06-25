
import { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Timer as TimerType } from "../../types";
import Timer from './Timer';
import AnimationManager, { CreationAnimationType, DeletionAnimationType } from '../animations/AnimationManager';

interface DraggableTimerItemProps {
  timer: TimerType;
  index: number;
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string, category?: string) => void;
  onUpdateDeadline: (id: string, deadline: Date | undefined) => void;
  onUpdatePriority: (id: string, priority: number | undefined) => void;
  newTimerId: string | null;
}

const DraggableTimerItem = ({
  timer,
  index,
  onToggle,
  onReset,
  onDelete,
  onRename,
  onUpdateDeadline,
  onUpdatePriority,
  newTimerId,
}: DraggableTimerItemProps) => {
  const [animationState, setAnimationState] = useState<{
    type: 'creation' | 'deletion' | null;
    animationType?: CreationAnimationType | DeletionAnimationType;
  }>({ type: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if this is a newly created timer that should show creation animation
  const isNewTimer = newTimerId === timer.id;

  const handleDelete = (id: string) => {
    console.log('🗑️ Starting deletion animation for timer:', id);
    setIsDeleting(true);
    setAnimationState({ type: 'deletion' });
  };

  const handleDeletionComplete = () => {
    console.log('✅ Deletion animation completed, calling onDelete');
    onDelete(timer.id);
    setIsDeleting(false);
    setAnimationState({ type: null });
  };

  const handleCreationComplete = () => {
    console.log('✅ Creation animation completed for timer:', timer.id);
    setAnimationState({ type: null });
  };

  const timerContent = (
    <Timer
      timer={timer}
      onToggle={onToggle}
      onReset={onReset}
      onDelete={handleDelete}
      onRename={onRename}
      onUpdateDeadline={onUpdateDeadline}
      onUpdatePriority={onUpdatePriority}
    />
  );

  // Wrap in creation animation for new timers
  if (isNewTimer && animationState.type !== 'deletion') {
    return (
      <Draggable draggableId={timer.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              transform: snapshot.isDragging 
                ? provided.draggableProps.style?.transform 
                : 'translate(0px, 0px)',
            }}
          >
            <AnimationManager
              type="creation"
              onComplete={handleCreationComplete}
            >
              {timerContent}
            </AnimationManager>
          </div>
        )}
      </Draggable>
    );
  }

  // Wrap in deletion animation when deleting
  if (animationState.type === 'deletion') {
    return (
      <AnimationManager
        type="deletion"
        onComplete={handleDeletionComplete}
      >
        {timerContent}
      </AnimationManager>
    );
  }

  // Default case - no animation
  return (
    <Draggable draggableId={timer.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            transform: snapshot.isDragging 
              ? provided.draggableProps.style?.transform 
              : 'translate(0px, 0px)',
          }}
        >
          {timerContent}
        </div>
      )}
    </Draggable>
  );
};

export default DraggableTimerItem;
