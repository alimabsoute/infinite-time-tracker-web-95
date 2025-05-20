
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timer as TimerType } from "../types";
import { Play, Pause, RotateCcw, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  timer: TimerType;
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
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

// Array of pastel colors for timer backgrounds
const pastelColors = [
  "#F2FCE2", // Soft Green
  "#FEF7CD", // Soft Yellow
  "#FEC6A1", // Soft Orange
  "#E5DEFF", // Soft Purple
  "#FFDEE2", // Soft Pink
  "#FDE1D3", // Soft Peach
  "#D3E4FD", // Soft Blue
  "#F1F0FB", // Soft Gray
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
  
  const longPressTimeoutRef = useRef<number | null>(null);
  const timerRef = useRef<HTMLDivElement>(null);
  
  // Determine a consistent color based on timer ID
  const colorIndex = parseInt(timer.id.slice(-5), 16) % pastelColors.length;
  const bgColor = pastelColors[colorIndex];
  
  // Handle long press logic - activate on ANY part of the timer
  const handleMouseDown = () => {
    if (isEditing) return; // Don't trigger long press during editing
    
    longPressTimeoutRef.current = window.setTimeout(() => {
      setIsEditing(true);
      setIsEnlarged(true);
      // Scroll to center this timer if needed
      timerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }, 1500); // 1.5 seconds for long press
  };
  
  const handleMouseUp = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);
  
  // Ensure new timer is centered on screen
  useEffect(() => {
    if (isNew && timerRef.current) {
      setTimeout(() => {
        timerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }, 100);
    }
  }, [isNew]);

  const handleRename = () => {
    onRename(timer.id, editedName);
    setIsEditing(false);
    setIsEnlarged(false);
  };

  const handleCancel = () => {
    if (isNew) {
      onDelete(timer.id);
    } else {
      setIsEditing(false);
      setIsEnlarged(false);
      setEditedName(timer.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    }
  };
  
  // Size classes based on whether this is a new/enlarged timer
  const sizeClasses = isEnlarged 
    ? "w-72 h-72 z-20" 
    : "w-40 h-40 hover:scale-105 transition-transform";
    
  // Position classes for enlarged timer - no longer using a card/background
  const positionClasses = isEnlarged 
    ? "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
    : "";

  return (
    <div 
      ref={timerRef}
      className={cn(
        "relative flex flex-col items-center justify-center",
        isEnlarged ? "mb-8" : "mb-4",
        positionClasses
      )}
    >
      {/* Overlay for enlarged timer */}
      {isEnlarged && (
        <div className="fixed inset-0 bg-black/50 z-10" onClick={handleCancel} />
      )}
      
      {/* Circular timer container */}
      <div 
        className={cn(
          "rounded-full shadow-lg flex flex-col items-center justify-center relative transition-all",
          sizeClasses,
          timer.isRunning ? "border-4 border-primary" : "border border-gray-200 dark:border-gray-700"
        )}
        style={{ backgroundColor: bgColor }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onTouchCancel={handleMouseUp}
      >
        {/* Edit/name section at top of circle */}
        <div className="absolute top-4 left-0 right-0 flex justify-center px-2">
          {isEditing ? (
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-3/4 h-8 text-sm bg-white/80"
              placeholder="Timer name"
            />
          ) : (
            <div className="font-medium text-center truncate w-3/4 px-2">
              {timer.name}
            </div>
          )}
        </div>
        
        {/* Timer display */}
        <div className={cn("font-bold text-center my-1", isEnlarged ? "text-4xl" : "text-2xl")}>
          {formatTime(timer.elapsedTime)}
        </div>
        
        {/* Controls at the bottom of the circle when not editing */}
        {!isEditing && (
          <div className="absolute bottom-4 flex justify-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onToggle(timer.id);
              }}
              className="h-8 w-8 p-0 rounded-full bg-white/30 hover:bg-white/50"
            >
              {timer.isRunning ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onReset(timer.id);
              }}
              className="h-8 w-8 p-0 rounded-full bg-white/30 hover:bg-white/50"
            >
              <RotateCcw size={16} />
            </Button>
          </div>
        )}
        
        {/* Add confirm/cancel buttons when editing - positioned higher up */}
        {isEditing && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }}
              className="absolute left-6 top-6 h-10 w-10 p-0 rounded-full bg-white/70 hover:bg-white/90"
            >
              <X size={20} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRename();
              }}
              className="absolute right-6 top-6 h-10 w-10 p-0 rounded-full bg-white/70 hover:bg-white/90"
            >
              <Check size={20} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Timer;
