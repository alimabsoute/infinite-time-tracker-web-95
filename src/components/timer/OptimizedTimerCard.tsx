
import React, { memo } from 'react';
import { Timer as TimerType } from '../../types';
import { getTimerColor } from '../../utils/timerUtils';
import TimerHeader from './TimerHeader';
import TimerEditForm from './TimerEditForm';
import TimerStatusIndicator from './TimerStatusIndicator';
import TimerContent from './TimerContent';

interface OptimizedTimerCardProps {
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

const OptimizedTimerCard: React.FC<OptimizedTimerCardProps> = memo(({
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
    <div 
      className="relative w-full max-w-[260px] mx-auto transition-all duration-200 hover:scale-[1.02]"
      style={{
        borderRadius: "8px",
        border: `2px solid ${timerColor}`,
        background: 'transparent',
        boxShadow: isRunning 
          ? `0 0 0 1px ${timerColor}, 0 0 12px ${timerColor}40, 0 1px 8px rgba(0, 0, 0, 0.06)` 
          : `0 0 0 1px ${timerColor}70, 0 1px 4px rgba(0, 0, 0, 0.04)`,
      }}
    >
      <div className="p-2 rounded-[6px]">
        {isEditing ? (
          <TimerEditForm
            nameInputRef={nameInputRef}
            editedName={editedName}
            editedCategory={editedCategory}
            onNameChange={onNameChange}
            onCategoryChange={onCategoryChange}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        ) : (
          <div className="flex flex-col space-y-1">
            <TimerHeader
              name={name}
              category={category}
              onEditClick={onEdit}
              onDeleteClick={onDelete}
            />
            
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
            
            <TimerStatusIndicator
              isRunning={isRunning}
              isPomodoroActive={isPomodoroActive}
              timerColor={timerColor}
            />
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.timer.id === nextProps.timer.id &&
    prevProps.currentTime === nextProps.currentTime &&
    prevProps.timer.isRunning === nextProps.timer.isRunning &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.editedName === nextProps.editedName &&
    prevProps.editedCategory === nextProps.editedCategory &&
    prevProps.selectedPriority === nextProps.selectedPriority &&
    prevProps.isPomodoroActive === nextProps.isPomodoroActive
  );
});

OptimizedTimerCard.displayName = 'OptimizedTimerCard';

export default OptimizedTimerCard;
