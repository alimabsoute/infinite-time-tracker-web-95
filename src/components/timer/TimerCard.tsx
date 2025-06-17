
import React from 'react';
import { Timer as TimerType } from '../../types';
import { getTimerColor } from '../../utils/timerUtils';
import TimerHeader from './TimerHeader';
import TimerEditForm from './TimerEditForm';
import TimerStatusIndicator from './TimerStatusIndicator';
import TimerContent from './TimerContent';

interface TimerCardProps {
  timer: TimerType;
  currentTime: number;
  isEditing: boolean;
  editedName: string;
  editedCategory: string;
  date: Date | undefined;
  selectedPriority: string;
  isPomodoroActive: boolean;
  currentPhase?: string;
  sessionCount: number;
  totalSessions: number;
  nameInputRef: React.RefObject<HTMLInputElement>;
  onToggle: () => void;
  onReset: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onDateSelect: (date: Date | undefined) => void;
}

const TimerCard: React.FC<TimerCardProps> = ({
  timer,
  currentTime,
  isEditing,
  editedName,
  editedCategory,
  date,
  selectedPriority,
  isPomodoroActive,
  nameInputRef,
  onToggle,
  onReset,
  onDelete,
  onEdit,
  onSubmit,
  onCancel,
  onNameChange,
  onCategoryChange,
  onPriorityChange,
  onDateSelect,
}) => {
  const { id, name, isRunning, category, deadline } = timer;
  const timerColor = getTimerColor(id);
  const isOverdue = deadline && new Date(deadline) < new Date();

  return (
    <article 
      className="relative group timer-card w-full max-w-[260px] mx-auto"
      role="region"
      aria-label={`Timer for ${name}${category ? ` in category ${category}` : ''}`}
      tabIndex={0}
    >
      <div className="p-2">
        {isEditing ? (
          <div role="form" aria-label="Edit timer">
            <TimerEditForm
              nameInputRef={nameInputRef}
              editedName={editedName}
              editedCategory={editedCategory}
              onNameChange={onNameChange}
              onCategoryChange={onCategoryChange}
              onSubmit={onSubmit}
              onCancel={onCancel}
            />
          </div>
        ) : (
          <div className="flex flex-col space-y-1">
            <header className="relative z-10">
              <TimerHeader
                name={name}
                category={category}
                onEditClick={onEdit}
                onDeleteClick={onDelete}
              />
            </header>
            
            <main className="flex-1">
              <TimerContent
                timerId={id}
                currentTime={currentTime}
                isRunning={isRunning}
                category={category}
                timerColor={timerColor}
                selectedPriority={selectedPriority}
                date={date}
                isOverdue={!!isOverdue}
                onToggle={onToggle}
                onReset={onReset}
                onPriorityChange={onPriorityChange}
                onDateSelect={onDateSelect}
              />
            </main>
            
            <TimerStatusIndicator
              isRunning={isRunning}
              isPomodoroActive={isPomodoroActive}
              timerColor={timerColor}
            />
          </div>
        )}
      </div>
    </article>
  );
};

export default TimerCard;
