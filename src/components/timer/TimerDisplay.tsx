
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
    <div className={`w-36 h-36 relative mx-auto ${isRunning ? 'timer-pulsing' : ''}`}>
      <CircularProgressbar
        value={progressPercentage}
        strokeWidth={4}
        styles={buildStyles({
          pathColor: timerColor,
          trailColor: 'rgba(226, 232, 240, 0.2)',
          textSize: '0px', // Hide the default text
          pathTransitionDuration: 0.3,
          rotation: 0.25,
          // Add a shadow to the path for more visibility
          strokeLinecap: 'round',
        })}
      />
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="text-xl font-semibold tracking-tight">
          {formatTime(currentTime)}
        </div>
        {category && (
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium opacity-80">
            {category}
          </div>
        )}
      </div>
      
      {sessionCount > 1 && (
        <Badge variant="secondary" className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-secondary/30 text-xs">
          {sessionCount} sessions
        </Badge>
      )}

      {/* Add animation styles globally via regular style tag */}
      <style>
        {`
          @keyframes subtle-pulse {
            0% {
              filter: drop-shadow(0 0 1px ${timerColor});
            }
            100% {
              filter: drop-shadow(0 0 5px ${timerColor});
            }
          }
          
          .timer-pulsing {
            animation: subtle-pulse 2s infinite alternate;
          }
        `}
      </style>
    </div>
  );
};

export default TimerDisplay;
