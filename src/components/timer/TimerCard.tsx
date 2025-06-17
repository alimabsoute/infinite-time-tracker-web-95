
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
    // Extract HSL values and create a much lighter, more pastel version
    const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
      const [, h, s, l] = hslMatch;
      return `hsla(${h}, ${Math.max(25, parseInt(s) - 40)}%, ${Math.min(92, parseInt(l) + 35)}%, 0.6)`;
    }
    return 'rgba(255, 255, 255, 0.8)';
  };

  const innerFillColor = getInnerFillColor(timerColor);

  return (
    <article 
      className="relative group w-72 h-72 mx-auto"
      role="region"
      aria-label={`Timer for ${name}${category ? ` in category ${category}` : ''}`}
      tabIndex={0}
    >
      {/* Perfect circular container */}
      <div 
        className={`w-full h-full rounded-full relative border-3 transition-all duration-300 hover:scale-105 ${
          isRunning ? 'timer-pulsing' : ''
        }`}
        style={{
          borderColor: timerColor,
          backgroundColor: innerFillColor,
          backdropFilter: 'blur(12px)',
          boxShadow: `0 12px 40px ${timerColor}25, inset 0 0 30px ${timerColor}15`,
        }}
      >
        {/* Floating Header Controls positioned outside circle at top */}
        <div className="absolute -top-8 left-0 right-0 z-20">
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

      <style>
        {`
          @keyframes gentle-pulse {
            0% {
              box-shadow: 0 12px 40px ${timerColor}25, inset 0 0 30px ${timerColor}15;
              transform: scale(1);
            }
            50% {
              box-shadow: 0 16px 50px ${timerColor}40, inset 0 0 40px ${timerColor}25;
              transform: scale(1.03);
            }
            100% {
              box-shadow: 0 12px 40px ${timerColor}25, inset 0 0 30px ${timerColor}15;
              transform: scale(1);
            }
          }
          
          .timer-pulsing {
            animation: gentle-pulse 2.5s infinite ease-in-out;
          }
        `}
      </style>
    </article>
  );
};

export default TimerCard;
