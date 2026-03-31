
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
    <div className="w-full h-full flex flex-col items-center justify-center relative p-8" role="region" aria-label="Timer content">
      {/* Timer Display - positioned in upper center */}
      <div className="absolute top-16">
        <TimerDisplay
          currentTime={currentTime}
          isRunning={isRunning}
          category={category}
          timerColor={timerColor}
        />
      </div>
      
      {/* Controls - positioned in center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <TimerControls
          isRunning={isRunning}
          onToggle={onToggle}
          onReset={onReset}
          timerColor={timerColor}
        />
      </div>
      
      {/* Metadata - positioned at bottom */}
      <div className="absolute bottom-16">
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
