
import React, { useEffect, useState } from 'react';
import { usePomodoro } from '@/hooks/usePomodoro';
import PomodoroTimerCard from './PomodoroTimerCard';

interface PomodoroTimerProps {
  timerId: string;
  isTimerRunning: boolean;
  onTimerToggle: () => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  timerId,
  isTimerRunning,
  onTimerToggle
}) => {
  const {
    pomodoroState,
    startPomodoroSession,
    stopPomodoroSession,
    resetPomodoroCycle,
  } = usePomodoro(timerId);

  const [remainingTime, setRemainingTime] = useState(0);

  // Update remaining time for current session
  useEffect(() => {
    if (!pomodoroState.currentSession || !pomodoroState.isActive) {
      setRemainingTime(0);
      return;
    }

    // Calculate initial remaining time
    const updateRemainingTime = () => {
      const elapsed = Date.now() - pomodoroState.currentSession!.startTime.getTime();
      const remaining = Math.max(0, pomodoroState.currentSession!.duration - elapsed);
      setRemainingTime(remaining);
      return remaining;
    };

    // Set initial time
    updateRemainingTime();

    // Set up interval to update every second
    const interval = setInterval(() => {
      const remaining = updateRemainingTime();
      
      // Session will be completed automatically by the hook's internal timer
      if (remaining === 0) {
        return;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pomodoroState.currentSession, pomodoroState.isActive]);

  const handleStartWork = () => {
    if (!isTimerRunning) {
      onTimerToggle(); // Start the regular timer
    }
    startPomodoroSession('work');
  };

  const handleStartBreak = () => {
    const isLongBreak = pomodoroState.sessionCount % pomodoroState.settings.sessionsUntilLongBreak === 0;
    startPomodoroSession(isLongBreak ? 'long-break' : 'short-break');
  };

  const handleStop = () => {
    stopPomodoroSession();
    if (isTimerRunning) {
      onTimerToggle(); // Stop the regular timer
    }
  };

  return (
    <PomodoroTimerCard
      pomodoroState={pomodoroState}
      remainingTime={remainingTime}
      onStartWork={handleStartWork}
      onStartBreak={handleStartBreak}
      onStop={handleStop}
      onReset={resetPomodoroCycle}
    />
  );
};

export default PomodoroTimer;
