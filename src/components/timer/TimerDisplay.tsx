
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Badge } from '../ui/badge';
import { formatTime } from './TimerUtils';

interface TimerDisplayProps {
  currentTime: number;
  isRunning: boolean;
  sessionCount: number;
}

const TimerDisplay = ({ currentTime, isRunning, sessionCount }: TimerDisplayProps) => {
  // Calculate progress percentage for circular progress
  const progressPercentage = Math.min(100, (currentTime / 3600000) * 100); // Max at 1 hour

  return (
    <div className="w-20 h-20 relative">
      <CircularProgressbar
        value={progressPercentage}
        text={`${formatTime(currentTime)}`}
        styles={buildStyles({
          pathColor: isRunning ? 'rgb(99 102 241)' : 'rgb(148 163 184)',
          trailColor: 'rgba(203, 213, 225, 0.2)',
          textSize: '1rem',
          textColor: 'var(--foreground)'
        })}
      />
      {sessionCount > 1 && (
        <Badge variant="secondary" className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-secondary/40 text-xs">
          {sessionCount} sessions
        </Badge>
      )}
    </div>
  );
};

export default TimerDisplay;
