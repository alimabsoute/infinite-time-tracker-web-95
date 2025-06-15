
import { useState, useRef, useEffect } from 'react';
import { Timer as TimerType } from '../../types';
import { cn } from '@/lib/utils';
import { getPriorityColor, getTimerColorClass } from './TimerUtils';
import TimerDisplay from './TimerDisplay';
import TimerHeader from './TimerHeader';
import TimerControls from './TimerControls';
import TimerMetadata from './TimerMetadata';
import TimerEditForm from './TimerEditForm';
import PomodoroTimer from '../pomodoro/PomodoroTimer';
import DeletionAnimation from '../animations/DeletionAnimations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('timer');
  const [deletionAnimationType] = useState<'explode' | 'melt' | 'crumble' | 'vaporize'>(() => {
    const animations: ('explode' | 'melt' | 'crumble' | 'vaporize')[] = ['explode', 'melt', 'crumble', 'vaporize'];
    return animations[Math.floor(Math.random() * animations.length)];
  });
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Get timer color class
  const timerColorClass = getTimerColorClass(id);
  const timerColor = `hsl(var(--timer-color))`;

  // Calculate total sessions (for display purposes)
  const sessionCount = 1; // Default to 1 if not available

  // Update time while running - FIXED to use a local interval that doesn't reset
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    // Set current time to match elapsed time from props when timer changes or stops
    setCurrentTime(elapsedTime);
    
    // Start a local interval for display updates
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentTime(prevTime => prevTime + 1000);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, elapsedTime, id]);

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

  // Handle deletion with animation
  const handleDelete = () => {
    setIsDeleting(true);
  };

  const handleDeletionComplete = () => {
    onDelete(id);
  };

  // Check if deadline is past
  const isOverdue = deadline && new Date(deadline) < new Date();

  const timerContent = (
    <div 
      className={`relative ${timerColorClass} mb-3 px-1`}
      style={{
        borderRadius: "0.5rem", 
        boxShadow: `0 0 0 2px ${timerColor}40, 0 4px 6px -1px rgba(0, 0, 0, 0.1)`,
        transition: "all 0.2s ease-in-out"
      }}
    >
      <div className="p-2 bg-transparent rounded-lg">
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
              onDeleteClick={handleDelete}
            />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-3">
                <TabsTrigger value="timer" className="text-xs">Timer</TabsTrigger>
                <TabsTrigger value="pomodoro" className="text-xs">Pomodoro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="timer" className="space-y-0">
                <div className="grid grid-cols-1 gap-0">
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
              </TabsContent>
              
              <TabsContent value="pomodoro" className="space-y-0">
                <PomodoroTimer
                  timerId={id}
                  isTimerRunning={isRunning}
                  onTimerToggle={() => onToggle(id)}
                />
              </TabsContent>
            </Tabs>
            
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

  if (isDeleting) {
    return (
      <DeletionAnimation
        animationType={deletionAnimationType}
        onComplete={handleDeletionComplete}
      >
        {timerContent}
      </DeletionAnimation>
    );
  }

  return timerContent;
};

export default Timer;
