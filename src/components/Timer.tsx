import { useState, useRef, useEffect } from 'react';
import { Timer as TimerType } from '../types';
import { Check, Clock, Pencil, Play, RefreshCw, Trash2, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type TimerProps = {
  timer: TimerType;
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string, category?: string) => void;
  onUpdateDeadline: (id: string, deadline: Date | undefined) => void;
  onUpdatePriority: (id: string, priority: number | undefined) => void;
  isNew?: boolean;
};

const Timer = ({
  timer,
  onToggle,
  onReset,
  onDelete,
  onRename,
  onUpdateDeadline,
  onUpdatePriority,
  isNew = false,
}: TimerProps) => {
  const { id, name, elapsedTime, isRunning, category, deadline, priority } = timer;

  // New state variables
  const [isEditing, setIsEditing] = useState(isNew);
  const [editedName, setEditedName] = useState(name);
  const [editedCategory, setEditedCategory] = useState(category || 'uncategorized');
  const [currentTime, setCurrentTime] = useState(elapsedTime);
  const [date, setDate] = useState<Date | undefined>(deadline ? new Date(deadline) : undefined);
  const [selectedPriority, setSelectedPriority] = useState<string>(priority?.toString() || 'none');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Calculate total sessions (for display purposes)
  const sessionCount = 1; // Default to 1 if not available

  // Format time helper function
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Update time while running
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentTime((prevTime) => prevTime + 1000);
      }, 1000);
    } else {
      setCurrentTime(elapsedTime);
    }
    return () => clearInterval(interval);
  }, [isRunning, elapsedTime]);

  // Auto-focus name input when editing begins
  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditing]);

  // Handle editing submission
  const handleSubmit = () => {
    if (editedName.trim() !== '') {
      onRename(id, editedName, editedCategory || undefined);
      setIsEditing(false);
    }
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setEditedCategory(value);
    if (!isEditing) {
      // Convert "uncategorized" back to empty string for the data model
      onRename(id, name, value === "uncategorized" ? undefined : value);
    }
  };

  // Handle priority change
  const handlePriorityChange = (value: string) => {
    setSelectedPriority(value);
    onUpdatePriority(id, value !== 'none' ? parseInt(value) : undefined);
  };

  // Handle deadline change
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onUpdateDeadline(id, selectedDate);
  };

  // Check if deadline is past
  const isOverdue = deadline && new Date(deadline) < new Date();

  // Determine color based on priority
  const getPriorityColor = () => {
    switch (priority) {
      case 3:
        return 'rgba(239, 68, 68, 0.85)'; // High - red
      case 2:
        return 'rgba(245, 158, 11, 0.85)'; // Medium - amber
      case 1:
        return 'rgba(34, 197, 94, 0.85)'; // Low - green
      default:
        return 'rgba(148, 163, 184, 0.85)'; // None - slate
    }
  };

  // Calculate progress percentage for circular progress
  const progressPercentage = Math.min(100, (elapsedTime / 3600000) * 100); // Max at 1 hour

  return (
    <Card className={`relative overflow-hidden shadow-lg mb-4 bg-card border-border/60 transition-all duration-300 ${isRunning ? 'ring-2 ring-primary/30' : ''}`}>
      <div className="p-4">
        {isEditing ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-3">
            <div className="flex">
              <Input
                ref={nameInputRef}
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="bg-background/70 border-border/30"
                placeholder="Timer name"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={editedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="bg-background/70 border-border/30 flex-1">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Study">Study</StudyItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Leisure">Leisure</SelectItem>
                  <SelectItem value="Project">Project</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => setIsEditing(false)}
                  className="bg-background/70 border-border/30"
                >
                  <X size={16} />
                </Button>
                <Button 
                  type="submit" 
                  variant="outline" 
                  size="icon"
                  className="bg-background/70 border-border/30"
                >
                  <Check size={16} />
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground flex items-center">
                  {name}
                  <Button 
                    onClick={() => setIsEditing(true)} 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 ml-1"
                  >
                    <Pencil size={14} />
                  </Button>
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {category && (
                    <Badge variant="secondary" className="bg-secondary/30 text-foreground">
                      {category}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-1">
                <Button 
                  onClick={() => onDelete(id)} 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-4 items-center">
              <div className="col-span-2 flex items-center justify-center">
                <div className="w-20 h-20 relative">
                  <CircularProgressbar
                    value={progressPercentage}
                    text={`${formatTime(currentTime)}`}
                    styles={buildStyles({
                      pathColor: isRunning ? 'rgb(99 102 241)' : 'rgb(148 163 184)',
                      trailColor: 'rgba(203, 213, 225, 0.2)',
                      textSize: '1rem',
                      textColor: 'var(--foreground)'
                    })}
                  />
                  {sessionCount > 1 && (
                    <Badge variant="secondary" className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-secondary/40 text-xs">
                      {sessionCount} sessions
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="col-span-3 space-y-2">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-muted-foreground">Priority</span>
                  <Select value={selectedPriority} onValueChange={handlePriorityChange}>
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
                        onSelect={handleDateSelect}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="col-span-2 flex flex-col space-y-1 items-center">
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={() => onToggle(id)}
                    className={cn(
                      "w-full h-10 text-sm",
                      isRunning 
                        ? "bg-amber-500/80 hover:bg-amber-500 text-amber-950" 
                        : "bg-emerald-500/80 hover:bg-emerald-500 text-emerald-950"
                    )}
                  >
                    {isRunning ? 'Pause' : 'Start'}
                  </Button>
                </div>
                
                <Button
                  onClick={() => onReset(id)}
                  variant="outline"
                  className="w-full h-9 text-sm bg-secondary/20"
                >
                  <RefreshCw size={14} className="mr-1"/> Reset
                </Button>
              </div>
            </div>
            
            {/* Priority indicator bar */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1"
              style={{ backgroundColor: getPriorityColor() }}
            />
            
            {/* Running indicator pulse */}
            {isRunning && (
              <div className="absolute top-1 right-1 flex items-center">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Timer;
