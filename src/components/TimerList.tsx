
import { useState } from "react";
import { Timer as TimerType } from "../types";
import Timer from "./Timer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  if (timers.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 text-lg">
        <p>No timers yet. Tap the + button to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex justify-end mb-2">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
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
        <div className="text-center py-8 text-gray-500">
          <p>No timers in this category. Try selecting a different category or create a new timer.</p>
        </div>
      )}
    </div>
  );
};

export default TimerList;
