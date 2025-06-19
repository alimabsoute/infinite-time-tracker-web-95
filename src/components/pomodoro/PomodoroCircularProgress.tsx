
import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { formatTime } from '@/components/timer/TimerUtils';

interface PomodoroCircularProgressProps {
  progressPercentage: number;
  remainingTime: number;
  isActive: boolean;
  timerColor: string;
  phaseLabel: string;
}

const PomodoroCircularProgress: React.FC<PomodoroCircularProgressProps> = ({
  progressPercentage,
  remainingTime,
  isActive,
  timerColor,
  phaseLabel
}) => {
  return (
    <div className="relative">
      <div className="w-24 h-24">
        <CircularProgressbar
          value={progressPercentage}
          text=""
          strokeWidth={6}
          styles={buildStyles({
            pathColor: timerColor,
            trailColor: `${timerColor}15`,
            backgroundColor: 'transparent',
            strokeLinecap: 'round',
            pathTransitionDuration: 0.2,
          })}
        />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-base font-bold leading-tight">
          {isActive ? formatTime(remainingTime) : '00:00'}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 opacity-60">
          {phaseLabel}
        </div>
      </div>
    </div>
  );
};

export default PomodoroCircularProgress;
