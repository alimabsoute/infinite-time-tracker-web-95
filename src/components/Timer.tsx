import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timer as TimerType } from "../types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Check, Edit, RotateCcw, Tag, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";

interface TimerProps {
  timer: TimerType;
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string, category?: string) => void;
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

// Enhanced timer colors - more vibrant for better visibility
const timerColors = [
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#14B8A6", // Teal
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

const Timer = ({ 
  timer, 
  onToggle, 
  onReset, 
  onDelete, 
  onRename,
  isNew = false 
}: TimerProps) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [editedName, setEditedName] = useState(timer.name);
  const [isEnlarged, setIsEnlarged] = useState(isNew);
  const [selectedCategory, setSelectedCategory] = useState(timer.category || "");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const timerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Determine a consistent color based on timer ID
  const colorIndex = parseInt(timer.id.slice(-5), 16) % timerColors.length;
  const primaryColor = timerColors[colorIndex];
  
  // Calculate contrasting text color based on background
  const getContrastingTextColor = (bgColor: string) => {
    // Using a fixed white text for now as our backgrounds are all deep enough
    return "#FFFFFF";
  };
  
  const textColor = getContrastingTextColor(primaryColor);
  
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
  
  // Size classes based on whether this is a new/enlarged timer
  const sizeClasses = isEnlarged 
    ? "w-64 h-64 z-20" 
    : "w-36 h-36 hover:scale-105 transition-transform";

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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10" onClick={handleCancel} />
          )}
          
          {/* Circular timer container */}
          <div 
            className={cn(
              "rounded-full flex flex-col items-center justify-center relative transition-all timer-circle",
              sizeClasses,
              isEnlarged ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 enlarged" : "",
              timer.isRunning ? "running" : ""
            )}
            style={{ 
              backgroundColor: primaryColor,
              color: textColor
            }}
            onClick={handleTimerClick}
          >
            {/* Category indicator */}
            {!isEditing && timer.category && (
              <div className="absolute top-2 right-2 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px] max-w-[70px] truncate">
                {timer.category}
              </div>
            )}
            
            {/* Edit/name section at top of circle */}
            <div className={cn(
              "absolute top-4 w-full flex justify-center px-2",
              isEnlarged ? "top-6" : ""
            )}>
              {isEditing ? (
                <Input
                  ref={inputRef}
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className={cn(
                    "text-center border-0 bg-white/20 focus-visible:ring-1 focus-visible:ring-white/40 focus-visible:ring-offset-0",
                    isEnlarged ? "text-lg" : "text-sm h-6 px-1"
                  )}
                  placeholder="Timer name"
                />
              ) : (
                <div className={cn(
                  "font-medium text-center truncate w-4/5 px-2",
                  isEnlarged ? "text-lg" : "text-sm"
                )}>
                  {timer.name}
                </div>
              )}
            </div>
            
            {/* Timer display */}
            <div className={cn(
              "font-bold text-center mt-4",
              isEnlarged ? "text-5xl" : "text-xl"
            )}>
              {formatTime(timer.elapsedTime)}
            </div>
            
            {/* Category selector - only visible when editing and enlarged */}
            {isEditing && isEnlarged && (
              <div className="absolute bottom-14 w-10/12">
                <Select 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="h-8 text-sm bg-white/20 border-white/20 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Action buttons - only visible when not editing and not enlarged */}
            {!isEditing && !isEnlarged && (
              <div className="absolute bottom-2 flex justify-center gap-1 mt-2">
                {timer.isRunning ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(timer.id);
                    }}
                    className="h-7 w-7 p-0 rounded-full bg-white/30 hover:bg-white/50"
                  >
                    <div className="w-2 h-4 bg-white rounded-sm"></div>
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(timer.id);
                    }}
                    className="h-7 w-7 p-0 rounded-full bg-white/30 hover:bg-white/50"
                  >
                    <div className="w-0 h-0 border-t-transparent border-t-8 border-b-transparent border-b-8 border-l-white border-l-12"></div>
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
                  className="absolute left-4 top-4 h-10 w-10 p-0 rounded-full bg-white/20 hover:bg-white/30"
                >
                  <X size={20} className="text-white" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename();
                  }}
                  className="absolute right-4 top-4 h-10 w-10 p-0 rounded-full bg-white/20 hover:bg-white/30"
                >
                  <Check size={20} className="text-white" />
                </Button>
              </>
            )}
            
            {/* Quick action buttons that appear on hover - only visible when not editing and not enlarged */}
            {!isEditing && !isEnlarged && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full bg-black/30">
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleEdit}
                    className="h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-white/40"
                  >
                    <Edit size={16} className="text-white" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDeleteRequest}
                    className="h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-red-400/40"
                  >
                    <Trash2 size={16} className="text-white" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleResetTimer}
                    className="h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-white/40"
                  >
                    <RotateCcw size={16} className="text-white" />
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
