
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
      className="relative group timer-card w-full max-w-sm mx-auto transition-all duration-300 hover:scale-102 hover:-translate-y-1 focus-within:outline-2 focus-within:outline-offset-2"
      style={{
        borderRadius: "0.75rem", 
        boxShadow: `0 0 0 2px ${timerColor}20, 0 4px 12px -2px rgba(0, 0, 0, 0.1)`,
        background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)/0.95) 100%)',
        border: `1px solid ${timerColor}30`,
        backdropFilter: 'blur(10px)',
        focusWithinOutlineColor: timerColor
      }}
      role="region"
      aria-label={`Timer for ${name}${category ? ` in category ${category}` : ''}`}
      tabIndex={0}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
        e.currentTarget.style.boxShadow = `0 0 0 2px ${timerColor}40, 0 8px 25px -5px rgba(0, 0, 0, 0.15)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = `0 0 0 2px ${timerColor}20, 0 4px 12px -2px rgba(0, 0, 0, 0.1)`;
      }}
    >
      {/* Enhanced hover and focus effects */}
      <div 
        className="p-3 sm:p-4 md:p-5 rounded-lg transition-all duration-300 group-hover:bg-card/80 group-focus-within:bg-card/80"
        style={{
          background: 'transparent'
        }}
      >
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
          <div className="flex flex-col space-y-2 sm:space-y-3">
            {/* Header with improved typography hierarchy */}
            <header className="relative z-10">
              <TimerHeader
                name={name}
                category={category}
                onEditClick={onEdit}
                onDeleteClick={onDelete}
              />
            </header>
            
            {/* Main content area */}
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
            
            {/* Status indicator */}
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
