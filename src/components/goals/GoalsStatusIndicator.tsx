
import React from 'react';
import PomodoroStatusIndicator from '@/components/pomodoro/PomodoroStatusIndicator';
import { Timer as TimerType } from '@/types';

interface GoalsStatusIndicatorProps {
  timers: TimerType[];
}

const GoalsStatusIndicator: React.FC<GoalsStatusIndicatorProps> = ({ timers }) => {
  // Map timers to the format expected by PomodoroStatusIndicator
  const timerData = timers.map(timer => ({
    id: timer.id,
    name: timer.name,
    isRunning: timer.isRunning
  }));

  return <PomodoroStatusIndicator timers={timerData} />;
};

export default GoalsStatusIndicator;
