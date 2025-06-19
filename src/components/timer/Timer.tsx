
import React, { useState, useRef, useEffect } from 'react';
import { Timer as TimerType } from '../../types';
import { formatTime } from './TimerUtils';
import TimerCard from './TimerCard';

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

const Timer: React.FC<TimerProps> = ({
  timer,
  onToggle,
  onReset,
  onDelete,
  onRename,
  onUpdateDeadline,
  onUpdatePriority,
  isNew = false,
}) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [editedName, setEditedName] = useState(timer.name);
  const [editedCategory, setEditedCategory] = useState(timer.category || '');
  const [selectedPriority, setSelectedPriority] = useState(timer.priority?.toString() || '');
  const [date, setDate] = useState<Date | undefined>(timer.deadline);
  
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedName(timer.name);
    setEditedCategory(timer.category || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedName.trim()) {
      onRename(timer.id, editedName.trim(), editedCategory.trim() || undefined);
      if (selectedPriority) {
        onUpdatePriority(timer.id, parseInt(selectedPriority));
      }
      if (date) {
        onUpdateDeadline(timer.id, date);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(timer.name);
    setEditedCategory(timer.category || '');
    setSelectedPriority(timer.priority?.toString() || '');
    setDate(timer.deadline);
    setIsEditing(false);
  };

  const handleToggle = () => {
    onToggle(timer.id);
  };

  const handleReset = () => {
    onReset(timer.id);
  };

  const handleDelete = () => {
    onDelete(timer.id);
  };

  const handlePriorityChange = (value: string) => {
    setSelectedPriority(value);
    const priority = value ? parseInt(value) : undefined;
    onUpdatePriority(timer.id, priority);
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    onUpdateDeadline(timer.id, newDate);
  };

  return (
    <TimerCard
      timer={timer}
      currentTime={timer.elapsedTime}
      isEditing={isEditing}
      editedName={editedName}
      editedCategory={editedCategory}
      date={date}
      selectedPriority={selectedPriority}
      isPomodoroActive={false}
      sessionCount={0}
      totalSessions={0}
      nameInputRef={nameInputRef}
      onToggle={handleToggle}
      onReset={handleReset}
      onDelete={handleDelete}
      onEdit={handleEdit}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onNameChange={setEditedName}
      onCategoryChange={setEditedCategory}
      onPriorityChange={handlePriorityChange}
      onDateSelect={handleDateSelect}
    />
  );
};

export default Timer;
