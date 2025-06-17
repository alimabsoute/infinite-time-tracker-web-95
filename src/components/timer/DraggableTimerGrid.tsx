
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Timer as TimerType } from "../../types";
import DraggableTimerItem from './DraggableTimerItem';

interface DraggableTimerGridProps {
  timers: TimerType[];
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string, category?: string) => void;
  onUpdateDeadline: (id: string, deadline: Date | undefined) => void;
  onUpdatePriority: (id: string, priority: number | undefined) => void;
  onReorder: (reorderedTimers: TimerType[]) => void;
  newTimerId: string | null;
}

const DraggableTimerGrid = ({
  timers,
  onToggle,
  onReset,
  onDelete,
  onRename,
  onUpdateDeadline,
  onUpdatePriority,
  onReorder,
  newTimerId,
}: DraggableTimerGridProps) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(timers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onReorder(items);
  };

  return (
    <div className="w-full max-w-[120rem] mx-auto px-12 py-8">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="timers" direction="horizontal">
          {(provided) => (
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-16 md:gap-20 lg:gap-24 xl:gap-28 2xl:gap-32 justify-items-center items-start"
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{
                minHeight: '400px',
                padding: '2rem 0'
              }}
            >
              {timers.map((timer, index) => (
                <DraggableTimerItem
                  key={timer.id}
                  timer={timer}
                  index={index}
                  onToggle={onToggle}
                  onReset={onReset}
                  onDelete={onDelete}
                  onRename={onRename}
                  onUpdateDeadline={onUpdateDeadline}
                  onUpdatePriority={onUpdatePriority}
                  newTimerId={newTimerId}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default DraggableTimerGrid;
