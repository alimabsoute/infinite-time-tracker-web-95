
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timer as TimerType } from "../types";
import { Check, X } from "lucide-react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Determine a consistent color based on timer ID
  const colorIndex = parseInt(timer.id.slice(-5), 16) % pastelColors.length;
  const bgColor = pastelColors[colorIndex];
  
  // Handle long press logic - activate on ANY part of the timer
  const handleMouseDown = () => {
    if (isEditing) return; // Don't trigger long press during editing
    
    longPressTimeoutRef.current = window.setTimeout(() => {
      setIsEditing(true);
      setIsEnlarged(true);
      // Focus the input after a brief delay to allow the component to render
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
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
    if ((isNew || isEnlarged) && timerRef.current) {
      setTimeout(() => {
        if (isNew && inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isNew, isEnlarged]);

  const handleRename = () => {
    onRename(timer.id, editedName || "Timer");
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
    ? "w-64 h-64 z-20" 
    : "w-36 h-36 hover:scale-105 transition-transform";

  return (
    <div 
      ref={timerRef}
      className={cn(
        "relative",
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
          "rounded-full flex flex-col items-center justify-center relative transition-all",
          sizeClasses,
          isEnlarged ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : "",
          timer.isRunning ? "border-4 border-primary" : "border-2 border-gray-300"
        )}
        style={{ backgroundColor: bgColor }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onTouchCancel={handleMouseUp}
      >
        {/* Edit/name section at top of circle */}
        <div className={cn(
          "absolute top-4 w-full flex justify-center px-2",
          isEnlarged ? "top-2" : ""
        )}>
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className={cn(
                "text-center border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
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
        
        {/* Controls are only visible when not editing */}
        {!isEditing && !isEnlarged && (
          <div className="absolute bottom-2 flex justify-center gap-2 mt-2">
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
                <div className="w-2 h-4 bg-gray-800 rounded-sm"></div>
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
                <div className="w-0 h-0 border-t-transparent border-t-8 border-b-transparent border-b-8 border-l-gray-800 border-l-12"></div>
              </Button>
            )}
          </div>
        )}
        
        {/* Add confirm/cancel buttons when editing - positioned at the top edges */}
        {isEditing && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }}
              className="absolute left-4 top-4 h-10 w-10 p-0 rounded-full bg-white"
            >
              <X size={20} className="text-red-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRename();
              }}
              className="absolute right-4 top-4 h-10 w-10 p-0 rounded-full bg-white"
            >
              <Check size={20} className="text-green-500" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Timer;
