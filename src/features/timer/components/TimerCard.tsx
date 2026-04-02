
import React from 'react';
import { Timer as TimerType } from '@/types';
import { getProcessedTimerColors } from '@/utils/timerColorProcessor';
import TimerHeader from './TimerHeader';
import TimerEditForm from './TimerEditForm';
import TimerStatusIndicator from './TimerStatusIndicator';
import TimerContent from './TimerContent';
import TimerCardContainer from './TimerCardContainer';
import TimerCircleBorder from './TimerCircleBorder';
import TimerRunningIndicator from './TimerRunningIndicator';

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
  const isOverdue = deadline && new Date(deadline) < new Date();


  // Get processed colors using the new utility
  const colors = getProcessedTimerColors(id);

  return (
    <TimerCardContainer name={name} category={category} timerId={id}>
      {/* Header positioned within card boundaries at top */}
      <div className="absolute top-0 left-4 right-4 z-20 pt-2">
        <TimerHeader
          name={name}
          category={category}
          onEditClick={onEdit}
          onDeleteClick={onDelete}
        />
      </div>

      {/* Enhanced circular timer container with multiple border layers */}
      <TimerCircleBorder colors={colors} isRunning={isRunning}>
        {/* Edit Form Overlay */}
        {isEditing && (
          <div className="absolute inset-4 z-30 flex items-center justify-center">
            <div className="bg-black/70 backdrop-blur-xl rounded-full p-6 w-full h-full flex items-center justify-center">
              <div className="w-full max-w-xs">
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
            </div>
          </div>
        )}

        {/* Main Timer Content */}
        {!isEditing && (
          <div className="w-full h-full flex items-center justify-center">
            <TimerContent
              timerId={id}
              currentTime={currentTime}
              isRunning={isRunning}
              category={category}
              timerColor={colors.primaryBorder}
              selectedPriority={selectedPriority}
              date={date}
              isOverdue={!!isOverdue}
              onToggle={onToggle}
              onReset={onReset}
              onPriorityChange={onPriorityChange}
              onDateSelect={onDateSelect}
            />
          </div>
        )}
        
        {/* Status Indicator positioned within circle */}
        <div className="absolute top-2 right-2 z-10">
          <TimerStatusIndicator
            isRunning={isRunning}
            isPomodoroActive={isPomodoroActive}
            timerColor={colors.primaryBorder}
          />
        </div>

        {/* Enhanced running indicator pulse */}
        <TimerRunningIndicator isRunning={isRunning} colors={colors} />
      </TimerCircleBorder>
    </TimerCardContainer>
  );
};

export default TimerCard;
