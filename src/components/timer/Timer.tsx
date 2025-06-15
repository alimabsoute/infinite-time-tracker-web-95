
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
import PomodoroStats from '../pomodoro/PomodoroStats';
import DeletionAnimation from '../animations/DeletionAnimations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { usePomodoro } from '@/hooks/usePomodoro';

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

  // Pomodoro integration
  const { pomodoroState } = usePomodoro(id);

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

  // Update time while running
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    setCurrentTime(elapsedTime);
    
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

  // Determine if Pomodoro is active for this timer
  const isPomodoroActive = pomodoroState.isActive && pomodoroState.currentSession?.timerId === id;

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
            
            {/* Pomodoro Status Badge */}
            {isPomodoroActive && (
              <div className="mb-2 flex justify-center">
                <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 border-red-200">
                  🍅 {pomodoroState.currentPhase?.replace('-', ' ')} session
                </Badge>
              </div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-3">
                <TabsTrigger value="timer" className="text-xs">Timer</TabsTrigger>
                <TabsTrigger value="pomodoro" className="text-xs">
                  Pomodoro
                  {pomodoroState.sessionCount > 0 && (
                    <Badge variant="outline" className="ml-1 h-4 text-[0.6rem] px-1">
                      {pomodoroState.sessionCount}
                    </Badge>
                  )}
                </TabsTrigger>
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
                
                {/* Pomodoro Quick Stats */}
                {pomodoroState.totalSessions > 0 && (
                  <PomodoroStats timerId={id} compact />
                )}
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
            {(isRunning || isPomodoroActive) && (
              <div className="absolute top-1 right-1 flex items-center">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: isPomodoroActive ? '#ef4444' : timerColor }}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: isPomodoroActive ? '#ef4444' : timerColor }}></span>
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
