
import React from 'react';
import { usePomodoro } from '@/hooks/usePomodoro';

interface SingleTimerPomodoroCheckProps {
  timerId: string;
  timerName: string;
  onActivePomodoro: (data: {
    timerId: string;
    timerName: string;
    isActive: boolean;
    currentPhase: string;
    sessionCount: number;
  }) => void;
}

const SingleTimerPomodoroCheck: React.FC<SingleTimerPomodoroCheckProps> = ({
  timerId,
  timerName,
  onActivePomodoro
}) => {
  const { pomodoroState } = usePomodoro(timerId);

  React.useEffect(() => {
    if (pomodoroState.isActive && pomodoroState.currentSession?.timerId === timerId) {
      onActivePomodoro({
        timerId,
        timerName,
        isActive: pomodoroState.isActive,
        currentPhase: pomodoroState.currentPhase,
        sessionCount: pomodoroState.sessionCount
      });
    }
  }, [pomodoroState, timerId, timerName, onActivePomodoro]);

  return null; // This component doesn't render anything
};

export default SingleTimerPomodoroCheck;
