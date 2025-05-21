
import { useState } from "react";
import { Timer as TimerType } from "../types";
import Timer from "./Timer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
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

interface TimerListProps {
  timers: TimerType[];
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string, category?: string) => void;
  newTimerId: string | null;
}

const TimerList = ({
  timers,
  onToggle,
  onReset,
  onDelete,
  onRename,
  newTimerId,
}: TimerListProps) => {
  const [filter, setFilter] = useState<string>("all");
  const [selectedTimers, setSelectedTimers] = useState<string[]>([]);
  const [showMultiDeleteDialog, setShowMultiDeleteDialog] = useState(false);
  
  // Get unique categories from timers
  const categories = Array.from(new Set(timers.map(timer => timer.category || "Uncategorized")));
  
  // Filter timers based on selected category
  const filteredTimers = filter === "all" 
    ? timers 
    : timers.filter(timer => 
        filter === "Uncategorized" 
          ? !timer.category 
          : timer.category === filter
      );

  // Handle batch deletion of selected timers
  const handleBatchDelete = () => {
    selectedTimers.forEach(id => onDelete(id));
    setSelectedTimers([]);
    setShowMultiDeleteDialog(false);
  };

  if (timers.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground text-lg">
        <p>No timers yet. Tap the + button to get started!</p>
      </div>
    );
  }

  const isSelectionMode = selectedTimers.length > 0;

  return (
    <div className="space-y-4">
      {/* Header with filter and batch actions */}
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
      
      {/* Timers grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 justify-items-center p-4">
        {filteredTimers.map((timer) => (
          <Timer
            key={timer.id}
            timer={timer}
            onToggle={onToggle}
            onReset={onReset}
            onDelete={onDelete}
            onRename={onRename}
            isNew={timer.id === newTimerId}
          />
        ))}
      </div>
      
      {/* Show message when filtered results are empty */}
      {filteredTimers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No timers in this category. Try selecting a different category or create a new timer.</p>
        </div>
      )}

      {/* Batch delete confirmation dialog */}
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

