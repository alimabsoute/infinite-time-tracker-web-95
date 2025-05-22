
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';

interface TimerMetadataProps {
  selectedPriority: string;
  date: Date | undefined;
  isOverdue: boolean;
  onPriorityChange: (value: string) => void;
  onDateSelect: (date: Date | undefined) => void;
}

const TimerMetadata = ({ 
  selectedPriority, 
  date, 
  isOverdue, 
  onPriorityChange, 
  onDateSelect 
}: TimerMetadataProps) => {
  // Map priority to color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "1": return "text-green-500 border-green-500/30";
      case "2": return "text-amber-500 border-amber-500/30";
      case "3": return "text-red-500 border-red-500/30";
      default: return "";
    }
  };

  // Map priority to text
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "1": return "Low";
      case "2": return "Medium";
      case "3": return "High";
      default: return "None";
    }
  };

  return (
    <div className="flex gap-3 justify-center mt-1">
      <div className="flex flex-col space-y-1 flex-1">
        <span className="text-xs text-muted-foreground">Priority</span>
        <Select value={selectedPriority} onValueChange={onPriorityChange}>
          <SelectTrigger 
            className={cn(
              "h-8 text-xs bg-secondary/30 border-secondary/50",
              getPriorityColor(selectedPriority)
            )}
          >
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="1" className="text-green-500">Low</SelectItem>
            <SelectItem value="2" className="text-amber-500">Medium</SelectItem>
            <SelectItem value="3" className="text-red-500">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col space-y-1 flex-1">
        <span className="text-xs text-muted-foreground">Deadline</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "w-full justify-start text-left font-normal h-8 text-xs bg-secondary/30 border-secondary/50",
                isOverdue && "text-destructive border-destructive"
              )}
            >
              <Clock className="mr-1 h-3 w-3" />
              {date ? format(date, 'MMM d') : <span>Set date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateSelect}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default TimerMetadata;
