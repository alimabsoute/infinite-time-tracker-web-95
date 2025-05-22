
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Badge } from '../ui/badge';
import { formatTime } from './TimerUtils';

interface TimerDisplayProps {
  currentTime: number;
  isRunning: boolean;
  sessionCount?: number;
  category?: string;
  timerColor?: string;
}

const TimerDisplay = ({ 
  currentTime, 
  isRunning, 
  sessionCount = 1, 
  category,
  timerColor = 'hsl(221, 83%, 53%)' 
}: TimerDisplayProps) => {
  // Calculate progress percentage for circular progress
  const progressPercentage = Math.min(100, (currentTime / 3600000) * 100); // Max at 1 hour

  return (
    <div className="w-48 h-48 relative mx-auto">
      <CircularProgressbar
        value={progressPercentage}
        strokeWidth={4}
        styles={buildStyles({
          pathColor: timerColor,
          trailColor: 'rgba(226, 232, 240, 0.3)',
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
