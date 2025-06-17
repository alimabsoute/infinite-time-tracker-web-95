
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
    <div className="space-y-3 sm:space-y-4" role="region" aria-label="Timer content">
      {/* Timer Display - Primary Focus */}
      <div className="flex items-center justify-center bg-gradient-to-b from-background/50 to-background/20 rounded-lg p-2 sm:p-3">
        <TimerDisplay
          currentTime={currentTime}
          isRunning={isRunning}
          category={category}
          timerColor={timerColor}
        />
      </div>
      
      {/* Controls and Metadata - Secondary Actions */}
      <div className="space-y-2 sm:space-y-3">
        {/* Primary Controls */}
        <div className="flex justify-center">
          <TimerControls
            isRunning={isRunning}
            onToggle={onToggle}
            onReset={onReset}
            timerColor={timerColor}
          />
        </div>
        
        {/* Metadata Section */}
        <div className="border-t border-border/30 pt-2 sm:pt-3">
          <TimerMetadata
            selectedPriority={selectedPriority}
            date={date}
            isOverdue={isOverdue}
            onPriorityChange={onPriorityChange}
            onDateSelect={onDateSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default TimerContent;
