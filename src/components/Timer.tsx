
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Timer as TimerType } from "../types";
import { Play, Pause, RotateCcw, Pencil, Check, Trash2 } from "lucide-react";

interface TimerProps {
  timer: TimerType;
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
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

const Timer = ({ timer, onToggle, onReset, onDelete, onRename }: TimerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(timer.name);

  const handleRename = () => {
    onRename(timer.id, editedName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    }
  };

  return (
    <Card className="timer-card p-4 shadow-md mb-4 bg-white dark:bg-gray-800">
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-2">
          {isEditing ? (
            <div className="flex space-x-2 w-full">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="flex-grow"
              />
              <Button size="sm" onClick={handleRename} variant="outline">
                <Check size={16} />
              </Button>
            </div>
          ) : (
            <>
              <h3 className="font-medium text-lg">{timer.name}</h3>
              <Button size="sm" onClick={() => setIsEditing(true)} variant="ghost">
                <Pencil size={16} />
              </Button>
            </>
          )}
        </div>
        
        <div className="text-3xl font-bold text-center my-2">
          {formatTime(timer.elapsedTime)}
        </div>
        
        <div className="flex justify-between mt-2 gap-2">
          <Button 
            variant={timer.isRunning ? "destructive" : "default"}
            size="sm"
            onClick={() => onToggle(timer.id)}
            className="flex-1"
          >
            {timer.isRunning ? <Pause size={16} /> : <Play size={16} />}
            {timer.isRunning ? " Pause" : " Start"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onReset(timer.id)}
            className="flex-1"
          >
            <RotateCcw size={16} className="mr-1" />
            Reset
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(timer.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Timer;
