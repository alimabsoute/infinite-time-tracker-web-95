
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
    <div className="space-y-1.5" role="region" aria-label="Timer content">
      <div className="flex items-center justify-center">
        <TimerDisplay
          currentTime={currentTime}
          isRunning={isRunning}
          category={category}
          timerColor={timerColor}
        />
      </div>
      
      <div className="space-y-1.5">
        <div className="flex justify-center">
          <TimerControls
            isRunning={isRunning}
            onToggle={onToggle}
            onReset={onReset}
            timerColor={timerColor}
          />
        </div>
        
        <div className="border-t border-border/15 pt-1.5">
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
