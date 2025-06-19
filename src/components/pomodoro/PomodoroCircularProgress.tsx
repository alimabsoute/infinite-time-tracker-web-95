
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
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '96px',
    height: '96px',
    aspectRatio: '1',
    borderRadius: '50%'
  };

  const progressStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    aspectRatio: '1',
    borderRadius: '50%'
  };

  const textOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: '1',
    borderRadius: '50%'
  };

  return (
    <div className="circular-progress-container" style={containerStyle}>
      <div style={progressStyle}>
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
      <div style={textOverlayStyle}>
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
