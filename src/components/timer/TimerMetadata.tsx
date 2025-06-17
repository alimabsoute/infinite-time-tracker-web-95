
import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);
  const [selectedTime, setSelectedTime] = useState<string>(
    date ? format(date, 'HH:mm') : '23:59'
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Map priority to color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "1": return "text-green-400 border-green-400/40";
      case "2": return "text-amber-400 border-amber-400/40";
      case "3": return "text-red-400 border-red-400/40";
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

  // Handle date selection from calendar
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate);
      // If we have a time, apply it to the selected date
      if (selectedTime) {
        const [hours, minutes] = selectedTime.split(':').map(Number);
        const finalDate = new Date(newDate);
        finalDate.setHours(hours, minutes, 0, 0);
        onDateSelect(finalDate);
      } else {
        // Default to end of day if no time is set
        const finalDate = new Date(newDate);
        finalDate.setHours(23, 59, 0, 0);
        onDateSelect(finalDate);
      }
    } else {
      setSelectedDate(undefined);
      onDateSelect(undefined);
    }
  };

  // Handle time change
  const handleTimeChange = (newTime: string) => {
    setSelectedTime(newTime);
    if (selectedDate && newTime) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const finalDate = new Date(selectedDate);
      finalDate.setHours(hours, minutes, 0, 0);
      onDateSelect(finalDate);
    }
  };

  // Apply current date and time
  const handleApplyDateTime = () => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const finalDate = new Date(selectedDate);
      finalDate.setHours(hours, minutes, 0, 0);
      onDateSelect(finalDate);
    }
    setIsPopoverOpen(false);
  };

  // Clear deadline
  const handleClearDeadline = () => {
    setSelectedDate(undefined);
    setSelectedTime('23:59');
    onDateSelect(undefined);
    setIsPopoverOpen(false);
  };

  return (
    <div className="flex gap-3 justify-center mt-2">
      <div className="flex flex-col space-y-2 flex-1">
        <span className="text-xs text-gray-300 font-medium">Priority</span>
        <Select value={selectedPriority} onValueChange={onPriorityChange}>
          <SelectTrigger 
            className={cn(
              "h-9 text-xs bg-white/10 border-white/20 text-white backdrop-blur-sm",
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
      
      <div className="flex flex-col space-y-2 flex-1">
        <span className="text-xs text-gray-300 font-medium">Deadline</span>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "w-full justify-start text-left font-normal h-9 text-xs bg-white/10 border-white/20 text-white backdrop-blur-sm",
                isOverdue && "text-red-400 border-red-400/60"
              )}
            >
              <Clock className="mr-1 h-3 w-3" />
              {date ? (
                <span>
                  {format(date, 'MMM d')} at {format(date, 'HH:mm')}
                </span>
              ) : (
                <span>Set deadline</span>
              )}
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
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                <Button 
                  onClick={handleApplyDateTime}
                  size="sm"
                  className="flex-1"
                  disabled={!selectedDate}
                >
                  Apply
                </Button>
                <Button 
                  onClick={handleClearDeadline}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Clear
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default TimerMetadata;
