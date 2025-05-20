
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timer as TimerType } from "../types";
import { Play, Pause, RotateCcw, Pencil, Check, X } from "lucide-react";
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
  
  // Handle long press logic
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
  
  // Calculate size classes based on whether this is a new/enlarged timer
  const sizeClasses = isEnlarged 
    ? "w-64 h-64 z-10" 
    : "w-40 h-40 hover:scale-105 transition-transform";
    
  // Position classes for enlarged timer
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
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onTouchCancel={handleMouseUp}
    >
      {/* Overlay for enlarged timer */}
      {isEnlarged && (
        <div className="fixed inset-0 bg-black/50 z-0" onClick={handleCancel} />
      )}
      
      {/* Circular timer container */}
      <div 
        className={cn(
          "rounded-full bg-white dark:bg-gray-800 shadow-lg flex flex-col items-center justify-center relative transition-all",
          sizeClasses,
          timer.isRunning ? "border-4 border-primary" : "border border-gray-200 dark:border-gray-700"
        )}
      >
        {/* Edit/name section at top of circle */}
        <div className="absolute top-4 left-0 right-0 flex justify-center px-2">
          {isEditing ? (
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-3/4 h-8 text-sm"
              placeholder="Timer name"
            />
          ) : (
            <div className="font-medium text-center truncate w-3/4 px-2">
              {timer.name}
            </div>
          )}
        </div>
        
        {/* Timer display */}
        <div className={cn("font-bold text-center my-1", isEnlarged ? "text-3xl" : "text-2xl")}>
          {formatTime(timer.elapsedTime)}
        </div>
        
        {/* Controls at the bottom of the circle */}
        {!isEditing && (
          <div className="absolute bottom-4 flex justify-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onToggle(timer.id);
              }}
              className="h-7 w-7 p-0 rounded-full"
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
              className="h-7 w-7 p-0 rounded-full"
            >
              <RotateCcw size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setIsEnlarged(true);
              }}
              className="h-7 w-7 p-0 rounded-full"
            >
              <Pencil size={16} />
            </Button>
          </div>
        )}
        
        {/* Add confirm/cancel buttons when editing */}
        {isEditing && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }}
              className={cn(
                "h-10 w-10 p-0 rounded-full",
                isEnlarged ? "absolute left-6 top-1/2 transform -translate-y-1/2" : "absolute left-2 top-1/2 transform -translate-y-1/2"
              )}
            >
              <X size={isEnlarged ? 24 : 16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRename();
              }}
              className={cn(
                "h-10 w-10 p-0 rounded-full",
                isEnlarged ? "absolute right-6 top-1/2 transform -translate-y-1/2" : "absolute right-2 top-1/2 transform -translate-y-1/2"
              )}
            >
              <Check size={isEnlarged ? 24 : 16} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Timer;
