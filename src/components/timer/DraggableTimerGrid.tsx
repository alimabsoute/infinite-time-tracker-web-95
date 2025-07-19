
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
  calculateSessionElapsedTime: (timer: TimerType) => number;
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
  calculateSessionElapsedTime,
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
    <div className="w-full max-w-[100rem] mx-auto px-6 py-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="timers" direction="horizontal">
          {(provided) => (
            <div 
              className="grid auto-fit-[280px] gap-8 lg:gap-12 xl:gap-16 justify-center items-start"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                maxWidth: '100%',
                width: '100%'
              }}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {timers.map((timer, index) => (
                <div key={timer.id} className="flex justify-center">
                  <DraggableTimerItem
                    timer={timer}
                    index={index}
                    onToggle={onToggle}
                    onReset={onReset}
                    onDelete={onDelete}
                    onRename={onRename}
                    onUpdateDeadline={onUpdateDeadline}
                    onUpdatePriority={onUpdatePriority}
                    calculateSessionElapsedTime={calculateSessionElapsedTime}
                    newTimerId={newTimerId}
                  />
                </div>
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
