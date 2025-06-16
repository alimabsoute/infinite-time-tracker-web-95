
import { useState, useRef, useEffect } from 'react';
import { Timer as TimerType } from '../../types';
import TimerCard from './TimerCard';
import DeletionAnimation from '../animations/DeletionAnimations';
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
  const { id, name, elapsedTime, category, deadline, priority } = timer;

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

  // Update time while running
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    setCurrentTime(elapsedTime);
    
    if (timer.isRunning) {
      interval = setInterval(() => {
        setCurrentTime(prevTime => prevTime + 1000);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.isRunning, elapsedTime, id]);

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

  // Determine if Pomodoro is active for this timer
  const isPomodoroActive = pomodoroState.isActive && pomodoroState.currentSession?.timerId === id;

  const timerContent = (
    <TimerCard
      timer={timer}
      currentTime={currentTime}
      isEditing={isEditing}
      editedName={editedName}
      editedCategory={editedCategory}
      date={date}
      selectedPriority={selectedPriority}
      activeTab={activeTab}
      isPomodoroActive={isPomodoroActive}
      currentPhase={pomodoroState.currentPhase}
      sessionCount={pomodoroState.sessionCount}
      totalSessions={pomodoroState.totalSessions}
      nameInputRef={nameInputRef}
      onToggle={() => onToggle(id)}
      onReset={() => onReset(id)}
      onDelete={handleDelete}
      onEdit={() => setIsEditing(true)}
      onSubmit={handleSubmit}
      onCancel={() => setIsEditing(false)}
      onNameChange={setEditedName}
      onCategoryChange={handleCategoryChange}
      onPriorityChange={handlePriorityChange}
      onDateSelect={handleDateSelect}
      onTabChange={setActiveTab}
    />
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
