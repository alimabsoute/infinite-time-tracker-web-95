
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import TimerMetadata from './TimerMetadata';
import PomodoroTimer from '../pomodoro/PomodoroTimer';
import PomodoroStats from '../pomodoro/PomodoroStats';

interface TimerContentProps {
  // Timer tab props
  timerId: string;
  currentTime: number;
  isRunning: boolean;
  category?: string;
  timerColor: string;
  selectedPriority: string;
  date: Date | undefined;
  isOverdue: boolean;
  totalSessions: number;
  onToggle: () => void;
  onReset: () => void;
  onPriorityChange: (value: string) => void;
  onDateSelect: (date: Date | undefined) => void;
}

const TimerContent: React.FC<TimerContentProps> = ({
  timerId,
  currentTime,
  isRunning,
  category,
  timerColor,
  selectedPriority,
  date,
  isOverdue,
  totalSessions,
  onToggle,
  onReset,
  onPriorityChange,
  onDateSelect,
}) => {
  return (
    <>
      <TabsContent value="timer" className="space-y-0">
        <div className="grid grid-cols-1 gap-0">
          <div className="flex items-center justify-center">
            <TimerDisplay
              currentTime={currentTime}
              isRunning={isRunning}
              category={category}
              timerColor={timerColor}
            />
          </div>
          
          <div className="space-y-1">
            <TimerControls
              isRunning={isRunning}
              onToggle={onToggle}
              onReset={onReset}
              timerColor={timerColor}
            />
            
            <TimerMetadata
              selectedPriority={selectedPriority}
              date={date}
              isOverdue={isOverdue}
              onPriorityChange={onPriorityChange}
              onDateSelect={onDateSelect}
            />
          </div>
        </div>
        
        {/* Pomodoro Quick Stats */}
        {totalSessions > 0 && (
          <PomodoroStats timerId={timerId} compact />
        )}
      </TabsContent>
      
      <TabsContent value="pomodoro" className="space-y-0">
        <PomodoroTimer
          timerId={timerId}
          isTimerRunning={isRunning}
          onTimerToggle={onToggle}
        />
      </TabsContent>
    </>
  );
};

export default TimerContent;
