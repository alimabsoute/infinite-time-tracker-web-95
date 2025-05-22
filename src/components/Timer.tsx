
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timer as TimerType } from "../types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Check, Clock, Edit, RotateCcw, Tag, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { format, isPast, isWithinInterval, addHours, addMinutes } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";

interface TimerProps {
  timer: TimerType;
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string, category?: string) => void;
  onUpdateDeadline: (id: string, deadline: Date | undefined) => void;
  onUpdatePriority: (id: string, priority: number | undefined) => void;
  isNew?: boolean;
}

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
};

// Enhanced timer colors with more vibrant, solid colors
const timerColors = [
  "#4F46E5", // Indigo
  "#DB2777", // Pink
  "#7C3AED", // Purple
  "#059669", // Emerald
  "#D97706", // Amber
  "#DC2626", // Red
  "#2563EB", // Blue
  "#0D9488", // Teal
];

// Available categories for timers
const categories = [
  "Work",
  "Personal",
  "Health",
  "Study",
  "Leisure",
  "Project",
  "Meeting",
  "Other",
];

// Priority levels
const priorityLevels = [1, 2, 3, 4, 5];

const Timer = ({ 
  timer, 
  onToggle, 
  onReset, 
  onDelete, 
  onRename,
  onUpdateDeadline,
  onUpdatePriority,
  isNew = false 
}: TimerProps) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [editedName, setEditedName] = useState(timer.name);
  const [isEnlarged, setIsEnlarged] = useState(isNew);
  const [selectedCategory, setSelectedCategory] = useState(timer.category || "");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<Date | undefined>(timer.deadline);
  const [selectedPriority, setSelectedPriority] = useState<number | undefined>(timer.priority);
  const [deadlineHours, setDeadlineHours] = useState(timer.deadline ? format(timer.deadline, "HH") : "12");
  const [deadlineMinutes, setDeadlineMinutes] = useState(timer.deadline ? format(timer.deadline, "mm") : "00");
  const [isBlinking, setIsBlinking] = useState(false);
  const [sessionCount, setSessionCount] = useState(timer.sessions || 0);
  
  const timerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Determine a consistent color based on timer ID
  const colorIndex = parseInt(timer.id.slice(-5), 16) % timerColors.length;
  const primaryColor = timerColors[colorIndex];
  
  // Calculate progress based on deadline if it exists
  const calculateProgress = () => {
    if (!timer.deadline) return 0;
    
    const now = new Date();
    const createdDate = new Date(timer.createdAt);
    const totalDuration = timer.deadline.getTime() - createdDate.getTime();
    const elapsedDuration = now.getTime() - createdDate.getTime();
    
    if (elapsedDuration >= totalDuration) return 100;
    return Math.round((elapsedDuration / totalDuration) * 100);
  };
  
  const progress = calculateProgress();
  
  // Check if deadline is approaching (within 1 hour) or passed
  useEffect(() => {
    if (!timer.deadline) return;

    // Determine if deadline is approaching or passed
    const now = new Date();
    const isApproaching = timer.deadline && 
      isWithinInterval(now, {
        start: addHours(timer.deadline, -1),
        end: timer.deadline
      });
    const hasExpired = timer.deadline && isPast(timer.deadline);
    
    // Set up blinking effect for approaching deadlines
    if (isApproaching || hasExpired) {
      const blinkInterval = setInterval(() => {
        setIsBlinking(prev => !prev);
      }, 1000);
      
      return () => clearInterval(blinkInterval);
    }
  }, [timer.deadline]);
  
  // Handle timer click - now just enlarges the timer view
  const handleTimerClick = () => {
    if (!isEditing) {
      setIsEnlarged(true);
    }
  };

  // Handle starting edit mode
  const handleEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setIsEditing(true);
    setIsEnlarged(true);
    // Focus the input after a brief delay to allow the component to render
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };
  
  // Ensure new timer is centered on screen
  useEffect(() => {
    if ((isNew || isEnlarged) && timerRef.current) {
      setTimeout(() => {
        if (isNew && inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isNew, isEnlarged]);

  const handleRename = () => {
    // If selectedCategory is "none", treat it as undefined (no category)
    const category = selectedCategory === "none" ? undefined : selectedCategory || undefined;
    onRename(timer.id, editedName || "Timer", category);
    
    // Update deadline and priority
    onUpdateDeadline(timer.id, selectedDeadline);
    onUpdatePriority(timer.id, selectedPriority);
    
    setIsEditing(false);
    setIsEnlarged(false);
  };

  const handleCancel = () => {
    if (isNew) {
      // For new timers, delete them when canceled
      onDelete(timer.id);
    } else if (isEnlarged) {
      // When in enlarged view, just close the enlarged view
      setIsEditing(false);
      setIsEnlarged(false);
      setEditedName(timer.name);
      setSelectedCategory(timer.category || "");
      setSelectedDeadline(timer.deadline);
      setSelectedPriority(timer.priority);
    }
  };

  const handleDeleteRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(timer.id);
    setShowDeleteDialog(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleResetTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReset(timer.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    }
  };
  
  const handleDeadlineChange = (date: Date | undefined) => {
    if (date) {
      // Apply the time from hours/minutes inputs
      const newDate = new Date(date);
      newDate.setHours(parseInt(deadlineHours));
      newDate.setMinutes(parseInt(deadlineMinutes));
      setSelectedDeadline(newDate);
    } else {
      setSelectedDeadline(undefined);
    }
  };
  
  const clearDeadline = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDeadline(undefined);
  };

  const formatDeadline = (date?: Date) => {
    if (!date) return "No deadline";
    return format(date, "MMM d, h:mm a");
  };

  // Format deadline time remaining or alert if passed
  const getDeadlineStatus = (deadline?: Date) => {
    if (!deadline) return null;
    
    const now = new Date();
    const isPassed = isPast(deadline);
    
    if (isPassed) {
      return <span className="text-red-500 font-bold">OVERDUE</span>;
    }
    
    // Calculate time remaining
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHrs}h remaining`;
    } else if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m remaining`;
    } else {
      return `${diffMins}m remaining`;
    }
  };
  
  // Size classes based on whether this is a new/enlarged timer
  const sizeClasses = isEnlarged 
    ? "w-64 h-64 z-20" 
    : "w-36 h-36 hover:scale-105 transition-transform";

  // Determine if deadline should be highlighted due to approaching or passed
  const deadlineClasses = cn(
    "text-xs",
    timer.deadline && isPast(timer.deadline) ? 
      "text-red-500 font-bold" : 
      (timer.deadline && isWithinInterval(new Date(), { 
        start: addHours(timer.deadline, -1), 
        end: timer.deadline 
      }) ? "text-yellow-300" : "text-white"),
    isBlinking ? "animate-pulse" : ""
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div 
          ref={timerRef}
          className={cn(
            "relative timer-container",
            isEnlarged ? "" : "mb-4"
          )}
        >
          {/* Overlay for enlarged timer */}
          {isEnlarged && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-10" onClick={handleCancel} />
          )}
          
          {/* Priority badge - show only if priority is set */}
          {timer.priority !== undefined && !isEditing && (
            <div 
              className="absolute -top-2 -right-2 bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10 shadow-md"
            >
              {timer.priority}
            </div>
          )}
          
          {/* Session count badge */}
          {!isEditing && (
            <div className="absolute -bottom-2 -left-2 bg-white/90 text-gray-800 rounded-full px-2 py-0.5 text-xs font-medium z-10 shadow-sm">
              <span className="mr-1">○</span>
              {sessionCount} sessions
            </div>
          )}
          
          {/* Circular timer container with progress ring */}
          <div 
            className={cn(
              "rounded-full flex flex-col items-center justify-center relative transition-all shadow-lg",
              sizeClasses,
              isEnlarged ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 enlarged" : "",
              timer.isRunning ? "glow-effect" : ""
            )}
            style={{ 
              backgroundColor: primaryColor,
              boxShadow: timer.isRunning ? `0 0 20px ${primaryColor}40` : 'none',
              border: `4px solid ${timer.isRunning ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}`
            }}
            onClick={handleTimerClick}
          >
            {/* Progress ring (only show if deadline exists and not editing) */}
            {timer.deadline && !isEditing && (
              <div className="absolute inset-0 rounded-full">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke={isPast(timer.deadline) ? "#f87171" : "#ffffff"}
                    strokeWidth="3"
                    strokeDasharray="289.1"
                    strokeDashoffset={289.1 - (289.1 * progress / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                  />
                </svg>
              </div>
            )}
            
            {/* Category indicator */}
            {!isEditing && timer.category && (
              <div className="absolute top-3 left-3 bg-black/30 px-1.5 py-0.5 rounded-full text-[10px] max-w-[70px] truncate text-white/90 border border-white/10">
                {timer.category}
              </div>
            )}
            
            {/* Edit/name section at top of circle */}
            <div className={cn(
              "absolute top-4 w-full flex justify-center px-2",
              isEnlarged ? "top-8" : ""
            )}>
              {isEditing ? (
                <Input
                  ref={inputRef}
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className={cn(
                    "text-center bg-black/30 text-white border-white/20 focus-visible:ring-white/30 focus-visible:ring-offset-0",
                    isEnlarged ? "text-lg" : "text-sm h-7 px-2"
                  )}
                  placeholder="Timer name"
                />
              ) : (
                <div className={cn(
                  "font-medium text-center truncate w-4/5 px-2 text-white",
                  isEnlarged ? "text-lg" : "text-sm"
                )}>
                  {timer.name}
                </div>
              )}
            </div>
            
            {/* Timer display */}
            <div className={cn(
              "font-bold text-center text-white",
              isEnlarged ? "text-5xl mt-2" : "text-xl"
            )}>
              {formatTime(timer.elapsedTime)}
            </div>
            
            {/* Display deadline if set (only when not editing) */}
            {!isEditing && timer.deadline && (
              <div className="absolute bottom-4 w-full flex justify-center">
                <div className={deadlineClasses}>
                  <Clock size={12} className="inline mr-1" />
                  {formatDeadline(timer.deadline)}
                </div>
              </div>
            )}
            
            {/* Category selector - only visible when editing and enlarged */}
            {isEditing && isEnlarged && (
              <div className="absolute bottom-36 w-10/12">
                <Select 
                  value={selectedCategory || "none"} 
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="h-8 text-sm bg-black/30 text-white border-white/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-white/20">
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Priority selector - only visible when editing and enlarged */}
            {isEditing && isEnlarged && (
              <div className="absolute bottom-[5.5rem] w-10/12 mt-2">
                <Select 
                  value={selectedPriority?.toString() || "no-priority"} 
                  onValueChange={(value) => setSelectedPriority(value === "no-priority" ? undefined : parseInt(value))}
                >
                  <SelectTrigger className="h-8 text-sm bg-black/30 text-white border-white/20 mt-2">
                    <SelectValue placeholder="Set priority (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-white/20">
                    <SelectItem value="no-priority">No Priority</SelectItem>
                    {priorityLevels.map(level => (
                      <SelectItem key={level} value={level.toString()}>
                        {level} {level === 1 ? "(Highest)" : level === 5 ? "(Lowest)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Deadline picker - only visible when editing and enlarged */}
            {isEditing && isEnlarged && (
              <div className="absolute bottom-16 w-10/12 mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-8 text-sm bg-black/30 text-white border-white/20 mt-2"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {selectedDeadline ? format(selectedDeadline, "PPP") : "Set deadline (optional)"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 text-white border-white/20" align="center">
                    <Calendar
                      mode="single"
                      selected={selectedDeadline}
                      onSelect={handleDeadlineChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                    <div className="p-3 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Input
                          className="w-14 bg-black/30 text-white border-white/20"
                          value={deadlineHours}
                          onChange={(e) => {
                            const hours = parseInt(e.target.value);
                            if (!isNaN(hours) && hours >= 0 && hours <= 23) {
                              setDeadlineHours(hours.toString().padStart(2, '0'));
                            }
                          }}
                          placeholder="HH"
                          maxLength={2}
                        />
                        <span>:</span>
                        <Input
                          className="w-14 bg-black/30 text-white border-white/20"
                          value={deadlineMinutes}
                          onChange={(e) => {
                            const mins = parseInt(e.target.value);
                            if (!isNaN(mins) && mins >= 0 && mins <= 59) {
                              setDeadlineMinutes(mins.toString().padStart(2, '0'));
                            }
                          }}
                          placeholder="MM"
                          maxLength={2}
                        />
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={clearDeadline}
                        className="text-white border-white/20"
                      >
                        Clear
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
            
            {/* Action buttons - only visible when not editing and not enlarged */}
            {!isEditing && !isEnlarged && (
              <div className="absolute bottom-3 flex justify-center gap-1">
                {timer.isRunning ? (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(timer.id);
                    }}
                    className="h-8 w-8 p-0 rounded-full bg-black/30 hover:bg-black/50 border border-white/10"
                  >
                    <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
                  </Button>
                ) : (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(timer.id);
                    }}
                    className="h-8 w-8 p-0 rounded-full bg-black/30 hover:bg-black/50 border border-white/10"
                  >
                    <div className="w-0 h-0 border-t-transparent border-t-[6px] border-b-transparent border-b-[6px] border-l-white border-l-[10px] ml-0.5"></div>
                  </Button>
                )}
              </div>
            )}
            
            {/* Action buttons for editing / cancel - when editing */}
            {isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                  className="absolute left-4 top-4 h-9 w-9 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white"
                >
                  <X size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename();
                  }}
                  className="absolute right-4 top-4 h-9 w-9 p-0 rounded-full bg-black/40 hover:bg-black/60 text-white"
                >
                  <Check size={18} />
                </Button>
              </>
            )}
            
            {/* Quick action buttons that appear on hover - only visible when not editing and not enlarged */}
            {!isEditing && !isEnlarged && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full bg-black/50 backdrop-blur-sm">
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleEdit}
                    className="h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-white/40"
                  >
                    <Edit size={15} className="text-white" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDeleteRequest}
                    className="h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-red-400/40"
                  >
                    <Trash2 size={15} className="text-white" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleResetTimer}
                    className="h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-white/40"
                  >
                    <RotateCcw size={15} className="text-white" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Delete confirmation dialog */}
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent className="max-w-[300px]">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Timer</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{timer.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </ContextMenuTrigger>
      
      {/* Context menu with additional options */}
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" /> Edit Timer
        </ContextMenuItem>
        <ContextMenuItem onClick={handleResetTimer}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset Timer
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDeleteRequest} className="text-red-500 focus:text-red-500">
          <Trash2 className="mr-2 h-4 w-4" /> Delete Timer
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default Timer;
