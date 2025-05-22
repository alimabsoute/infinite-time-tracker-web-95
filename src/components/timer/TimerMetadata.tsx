
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
  return (
    <div className="space-y-2">
      <div className="flex flex-col space-y-1">
        <span className="text-xs text-muted-foreground">Priority</span>
        <Select value={selectedPriority} onValueChange={onPriorityChange}>
          <SelectTrigger className="h-8 text-sm bg-secondary/30">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="1">Low</SelectItem>
            <SelectItem value="2">Medium</SelectItem>
            <SelectItem value="3">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col space-y-1">
        <span className="text-xs text-muted-foreground">Deadline</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "w-full justify-start text-left font-normal h-8 text-sm bg-secondary/30",
                isOverdue && "text-destructive border-destructive"
              )}
            >
              <Clock className="mr-2 h-3 w-3" />
              {date ? format(date, 'PPP') : <span>Set deadline</span>}
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
