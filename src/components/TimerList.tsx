
import { useState } from "react";
import { Timer as TimerType } from "../types";
import Timer from "./Timer";
import EmptyState from "./EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "./ui/button";
import { ArrowDownAZ, ArrowDownUp, Clock, Trash2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useTimerPerformance } from '../hooks/useTimerPerformance';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

type SortOption = "custom" | "name" | "priority" | "deadline";

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
  const [filter, setFilter] = useState<string>("all");
  const [selectedTimers, setSelectedTimers] = useState<string[]>([]);
  const [showMultiDeleteDialog, setShowMultiDeleteDialog] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("custom");
  
  const { filteredTimers, sortedTimers, categories } = useTimerPerformance({
    timers,
    filter,
    sortBy
  });

  const handleBatchDelete = () => {
    selectedTimers.forEach(id => onDelete(id));
    setSelectedTimers([]);
    setShowMultiDeleteDialog(false);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(filteredTimers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onReorder(items);
  };

  if (timers.length === 0) {
    return (
      <EmptyState 
        type="timers" 
        onCreateTimer={onCreateTimer}
        showCreateButton={!!onCreateTimer}
      />
    );
  }

  const isSelectionMode = selectedTimers.length > 0;
  const isDraggable = sortBy === "custom";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {isSelectionMode && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowMultiDeleteDialog(true)}
              className="flex items-center gap-1"
            >
              <Trash2 size={16} /> Delete Selected ({selectedTimers.length})
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ArrowDownUp size={16} /> Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("custom")}>
                Custom Order
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                <ArrowDownAZ className="mr-2 h-4 w-4" /> By Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("priority")}>
                By Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("deadline")}>
                <Clock className="mr-2 h-4 w-4" /> By Deadline
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px] bg-secondary/50 border-secondary">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="bg-secondary border-secondary text-foreground">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.sort().map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="timers" direction="horizontal" isDropDisabled={!isDraggable}>
          {(provided) => (
            <div 
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-center p-2"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {sortedTimers.map((timer, index) => (
                <Draggable 
                  key={timer.id} 
                  draggableId={timer.id} 
                  index={index}
                  isDragDisabled={!isDraggable}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        cursor: isDraggable ? 'grab' : 'default',
                      }}
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
      
      {filteredTimers.length === 0 && (
        <div className="text-center py-8">
          <EmptyState 
            type="timers" 
            onCreateTimer={onCreateTimer}
            showCreateButton={false}
          />
          <p className="text-muted-foreground mt-4">
            No timers in this category. Try selecting a different category or create a new timer.
          </p>
        </div>
      )}

      <AlertDialog open={showMultiDeleteDialog} onOpenChange={setShowMultiDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Timers</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTimers.length} timer{selectedTimers.length !== 1 && 's'}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowMultiDeleteDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete} className="bg-red-500 hover:bg-red-600">
              Delete {selectedTimers.length} timer{selectedTimers.length !== 1 && 's'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TimerList;
