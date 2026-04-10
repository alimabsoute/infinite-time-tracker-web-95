import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@shared/components/ui/button';
import { Calendar } from '@shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { cn } from '@shared/lib/utils';
import { useState } from 'react';

interface TimerMetadataProps {
  selectedPriority: string;
  date: Date | undefined;
  isOverdue: boolean;
  onPriorityChange: (value: string) => void;
  onDateSelect: (date: Date | undefined) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case '1': return 'text-emerald-600 border-emerald-300';
    case '2': return 'text-amber-600 border-amber-300';
    case '3': return 'text-destructive border-destructive/40';
    default: return 'text-muted-foreground border-border';
  }
};

const TimerMetadata = ({
  selectedPriority,
  date,
  isOverdue,
  onPriorityChange,
  onDateSelect,
}: TimerMetadataProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);
  const [selectedTime, setSelectedTime] = useState<string>(date ? format(date, 'HH:mm') : '23:59');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const final = new Date(newDate);
      final.setHours(hours, minutes, 0, 0);
      onDateSelect(final);
    } else {
      setSelectedDate(undefined);
      onDateSelect(undefined);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setSelectedTime(newTime);
    if (selectedDate && newTime) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const final = new Date(selectedDate);
      final.setHours(hours, minutes, 0, 0);
      onDateSelect(final);
    }
  };

  const handleApply = () => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const final = new Date(selectedDate);
      final.setHours(hours, minutes, 0, 0);
      onDateSelect(final);
    }
    setIsPopoverOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(undefined);
    setSelectedTime('23:59');
    onDateSelect(undefined);
    setIsPopoverOpen(false);
  };

  return (
    <div className="flex gap-3 justify-center">
      <Select value={selectedPriority} onValueChange={onPriorityChange}>
        <SelectTrigger
          className={cn(
            'h-7 w-20 text-xs bg-card border rounded-full',
            getPriorityColor(selectedPriority)
          )}
        >
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="1" className="text-emerald-600">Low</SelectItem>
          <SelectItem value="2" className="text-amber-600">Med</SelectItem>
          <SelectItem value="3" className="text-destructive">High</SelectItem>
        </SelectContent>
      </Select>

      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-7 px-3 text-xs bg-card border rounded-full',
              isOverdue ? 'text-destructive border-destructive/40' : 'text-muted-foreground'
            )}
          >
            <Clock className="mr-1 h-3 w-3" />
            {date ? format(date, 'MMM d') : 'Set'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col space-y-4 p-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                className="pointer-events-auto border rounded-md"
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Time</Label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleApply} size="sm" className="flex-1" disabled={!selectedDate}>
                Apply
              </Button>
              <Button onClick={handleClear} variant="outline" size="sm" className="flex-1">
                Clear
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TimerMetadata;
