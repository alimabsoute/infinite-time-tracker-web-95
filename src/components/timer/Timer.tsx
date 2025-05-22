
import { useState, useRef, useEffect } from 'react';
import { Timer as TimerType } from '../../types';
import { cn } from '@/lib/utils';
import { getPriorityColor, getTimerColorClass } from './TimerUtils';
import TimerDisplay from './TimerDisplay';
import TimerHeader from './TimerHeader';
import TimerControls from './TimerControls';
import TimerMetadata from './TimerMetadata';
import TimerEditForm from './TimerEditForm';

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

  // State variables
  const [isEditing, setIsEditing] = useState(isNew);
  const [editedName, setEditedName] = useState(name);
  const [editedCategory, setEditedCategory] = useState(category || 'uncategorized');
  const [currentTime, setCurrentTime] = useState(elapsedTime);
  const [date, setDate] = useState<Date | undefined>(deadline ? new Date(deadline) : undefined);
  const [selectedPriority, setSelectedPriority] = useState<string>(priority?.toString() || 'none');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Get timer color class
  const timerColorClass = getTimerColorClass(id);
  const timerColor = `hsl(var(--timer-color))`;

  // Calculate total sessions (for display purposes)
  const sessionCount = 1; // Default to 1 if not available

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedName.trim() !== '') {
      onRename(id, editedName, editedCategory === 'uncategorized' ? undefined : editedCategory);
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

  return (
    <div className={`relative ${timerColorClass} mb-4 px-1`}>
      <div className="p-3 bg-transparent rounded-lg">
        {isEditing ? (
          <TimerEditForm
            nameInputRef={nameInputRef}
            editedName={editedName}
            editedCategory={editedCategory}
            onNameChange={setEditedName}
            onCategoryChange={handleCategoryChange}
            onSubmit={handleSubmit}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className="flex flex-col">
            <TimerHeader
              name={name}
              category={category}
              onEditClick={() => setIsEditing(true)}
              onDeleteClick={() => onDelete(id)}
            />
            
            <div className="grid grid-cols-1 gap-1">
              <div className="flex items-center justify-center">
                <TimerDisplay
                  currentTime={currentTime}
                  isRunning={isRunning}
                  category={category}
                  timerColor={timerColor}
                />
              </div>
              
              <div className="space-y-1">
                <TimerControls
                  isRunning={isRunning}
                  onToggle={() => onToggle(id)}
                  onReset={() => onReset(id)}
                  timerColor={timerColor}
                />
                
                <TimerMetadata
                  selectedPriority={selectedPriority}
                  date={date}
                  isOverdue={!!isOverdue}
                  onPriorityChange={handlePriorityChange}
                  onDateSelect={handleDateSelect}
                />
              </div>
            </div>
            
            {/* Running indicator pulse */}
            {isRunning && (
              <div className="absolute top-1 right-1 flex items-center">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: timerColor }}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: timerColor }}></span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timer;
