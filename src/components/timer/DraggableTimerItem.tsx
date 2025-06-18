
import { Draggable } from 'react-beautiful-dnd';
import { Timer as TimerType } from "../../types";
import Timer from "./Timer";

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
  return (
    <Draggable 
      key={timer.id} 
      draggableId={timer.id} 
      index={index}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            cursor: 'grab',
            width: '280px',
            height: '320px'
          }}
          className="flex-shrink-0"
        >
          <Timer
            timer={timer}
            onToggle={onToggle}
            onReset={onReset}
            onDelete={onDelete}
            onRename={onRename}
            onUpdateDeadline={onUpdateDeadline}
            onUpdatePriority={onUpdatePriority}
            isNew={timer.id === newTimerId}
          />
        </div>
      )}
    </Draggable>
  );
};

export default DraggableTimerItem;
