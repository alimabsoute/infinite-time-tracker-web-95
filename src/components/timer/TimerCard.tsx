
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

  // Get darker pastel color for inner fill
  const getInnerFillColor = (color: string) => {
    // Extract HSL values and create a darker, more muted version
    const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
      const [, h, s, l] = hslMatch;
      return `hsla(${h}, ${Math.max(20, parseInt(s) - 30)}%, ${Math.max(15, parseInt(l) - 25)}%, 0.4)`;
    }
    return 'rgba(0, 0, 0, 0.3)';
  };

  const innerFillColor = getInnerFillColor(timerColor);

  return (
    <article 
      className="relative group w-64 h-64 mx-auto"
      role="region"
      aria-label={`Timer for ${name}${category ? ` in category ${category}` : ''}`}
      tabIndex={0}
    >
      {/* Main circular container */}
      <div 
        className={`w-full h-full rounded-full relative border-4 transition-all duration-300 hover:scale-105 ${
          isRunning ? 'timer-pulsing' : ''
        }`}
        style={{
          borderColor: timerColor,
          backgroundColor: innerFillColor,
          backdropFilter: 'blur(8px)',
          boxShadow: `0 8px 32px ${timerColor}30, inset 0 0 20px ${timerColor}20`,
        }}
      >
        {/* Floating Header Controls (outside the circle) */}
        <div className="absolute -top-6 left-0 right-0 z-20">
          <TimerHeader
            name={name}
            category={category}
            onEditClick={onEdit}
            onDeleteClick={onDelete}
          />
        </div>

        {/* Edit Form Overlay */}
        {isEditing && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-6">
            <div className="bg-black/80 backdrop-blur-md rounded-2xl p-4 w-full max-w-xs">
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
        )}

        {/* Main Timer Content (overlaid on circle) */}
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
        
        {/* Status Indicator */}
        <TimerStatusIndicator
          isRunning={isRunning}
          isPomodoroActive={isPomodoroActive}
          timerColor={timerColor}
        />
      </div>

      <style>
        {`
          @keyframes subtle-pulse {
            0% {
              box-shadow: 0 8px 32px ${timerColor}30, inset 0 0 20px ${timerColor}20;
              transform: scale(1);
            }
            50% {
              box-shadow: 0 12px 40px ${timerColor}50, inset 0 0 30px ${timerColor}30;
              transform: scale(1.02);
            }
            100% {
              box-shadow: 0 8px 32px ${timerColor}30, inset 0 0 20px ${timerColor}20;
              transform: scale(1);
            }
          }
          
          .timer-pulsing {
            animation: subtle-pulse 2s infinite ease-in-out;
          }
        `}
      </style>
    </article>
  );
};

export default TimerCard;
