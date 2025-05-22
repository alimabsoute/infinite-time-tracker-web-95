
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Badge } from '../ui/badge';
import { formatTime } from './TimerUtils';

interface TimerDisplayProps {
  currentTime: number;
  isRunning: boolean;
  sessionCount?: number;
  category?: string;
}

const TimerDisplay = ({ currentTime, isRunning, sessionCount = 1, category }: TimerDisplayProps) => {
  // Calculate progress percentage for circular progress
  const progressPercentage = Math.min(100, (currentTime / 3600000) * 100); // Max at 1 hour

  return (
    <div className="w-48 h-48 relative mx-auto">
      <CircularProgressbar
        value={progressPercentage}
        strokeWidth={4}
        styles={buildStyles({
          pathColor: isRunning ? 'rgb(99 102 241)' : 'rgb(148 163 184)',
          trailColor: 'rgba(203, 213, 225, 0.2)',
          textSize: '0px', // Hide the default text
        })}
      />
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="text-3xl font-medium">
          {formatTime(currentTime)}
        </div>
        {category && (
          <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
            {category}
          </div>
        )}
      </div>
      
      {sessionCount > 1 && (
        <Badge variant="secondary" className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-secondary/40 text-xs">
          {sessionCount} sessions
        </Badge>
      )}
    </div>
  );
};

export default TimerDisplay;
