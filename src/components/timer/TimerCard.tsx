
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

  // Get lighter pastel color for inner fill
  const getInnerFillColor = (color: string) => {
    const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
      const [, h, s, l] = hslMatch;
      return `hsla(${h}, ${Math.max(25, parseInt(s) - 40)}%, ${Math.min(92, parseInt(l) + 35)}%, 0.8)`;
    }
    return 'rgba(255, 255, 255, 0.9)';
  };

  const innerFillColor = getInnerFillColor(timerColor);

  return (
    <article 
      className="relative group w-72 h-72 mx-auto flex-shrink-0"
      role="region"
      aria-label={`Timer for ${name}${category ? ` in category ${category}` : ''}`}
      tabIndex={0}
      style={{
        minWidth: '288px',
        minHeight: '288px'
      }}
    >
      {/* Spinning gradient border - only this spins */}
      <div 
        className={`absolute inset-0 rounded-full ${isRunning ? 'animate-spin' : ''}`}
        style={{
          background: `conic-gradient(from 0deg, ${timerColor}, transparent 60%, ${timerColor})`,
          animation: isRunning ? 'spin 3s linear infinite' : 'none',
        }}
      />
      
      {/* Stationary content container */}
      <div 
        className="absolute inset-2 rounded-full transition-all duration-300 hover:scale-105"
        style={{
          backgroundColor: innerFillColor,
          backdropFilter: 'blur(15px)',
          boxShadow: `inset 0 0 40px ${timerColor}20, 0 8px 32px ${timerColor}15`,
        }}
      >
        {/* Header positioned at top left outside the circle */}
        <div className="absolute -top-12 -left-4 z-20 max-w-64">
          <TimerHeader
            name={name}
            category={category}
            onEditClick={onEdit}
            onDeleteClick={onDelete}
          />
        </div>

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

        {/* Main Timer Content centered in circle */}
        {!isEditing && (
          <div className="absolute inset-0 flex items-center justify-center">
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
          </div>
        )}
        
        {/* Status Indicator positioned at top right */}
        <div className="absolute -top-2 -right-2 z-10">
          <TimerStatusIndicator
            isRunning={isRunning}
            isPomodoroActive={isPomodoroActive}
            timerColor={timerColor}
          />
        </div>
      </div>
    </article>
  );
};

export default TimerCard;
