
import React from 'react';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import TimerMetadata from './TimerMetadata';

interface TimerContentProps {
  timerId: string;
  currentTime: number;
  isRunning: boolean;
  category?: string;
  timerColor: string;
  selectedPriority: string;
  date: Date | undefined;
  isOverdue: boolean;
  onToggle: () => void;
  onReset: () => void;
  onPriorityChange: (value: string) => void;
  onDateSelect: (date: Date | undefined) => void;
}

const TimerContent: React.FC<TimerContentProps> = ({
  currentTime,
  isRunning,
  category,
  timerColor,
  selectedPriority,
  date,
  isOverdue,
  onToggle,
  onReset,
  onPriorityChange,
  onDateSelect,
}) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative" role="region" aria-label="Timer content">
      {/* Main Timer Display - centered */}
      <div className="flex-1 flex items-center justify-center">
        <TimerDisplay
          currentTime={currentTime}
          isRunning={isRunning}
          category={category}
          timerColor={timerColor}
        />
      </div>
      
      {/* Controls - positioned at bottom center */}
      <div className="absolute bottom-6">
        <TimerControls
          isRunning={isRunning}
          onToggle={onToggle}
          onReset={onReset}
          timerColor={timerColor}
        />
      </div>
      
      {/* Metadata - positioned at very bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-2">
        <TimerMetadata
          selectedPriority={selectedPriority}
          date={date}
          isOverdue={isOverdue}
          onPriorityChange={onPriorityChange}
          onDateSelect={onDateSelect}
        />
      </div>
    </div>
  );
};

export default TimerContent;
