
import { Timer as TimerType } from "../types";
import Timer from "./Timer";
import EmptyState from "./EmptyState";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface TimerListProps {
  timers: TimerType[];
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string, category?: string) => void;
  onUpdateDeadline: (id: string, deadline: Date | undefined) => void;
  onUpdatePriority: (id: string, priority: number | undefined) => void;
  onReorder: (reorderedTimers: TimerType[]) => void;
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
  newTimerId,
  onCreateTimer,
}: TimerListProps) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(timers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onReorder(items);
  };

  if (timers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState 
          type="timers" 
          onCreateTimer={onCreateTimer}
          showCreateButton={!!onCreateTimer}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="timers" direction="horizontal">
          {(provided) => (
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 justify-items-center"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {timers.map((timer, index) => (
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
                      }}
                      className="w-full"
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
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default TimerList;
