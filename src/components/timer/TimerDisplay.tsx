
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Badge } from '../ui/badge';
import { formatTime, getTimerProgress } from '../../utils/timerUtils';

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
  const progressPercentage = Math.min(100, (currentTime / 3600000) * 100); // Max at 1 hour
  const formattedTime = formatTime(currentTime);

  return (
    <div 
      className={`w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 relative mx-auto ${
        isRunning ? 'timer-pulsing' : ''
      }`}
      role="timer"
      aria-label={`Timer showing ${formattedTime}${category ? ` for ${category}` : ''}`}
      aria-live={isRunning ? "polite" : "off"}
      tabIndex={0}
    >
      <CircularProgressbar
        value={progressPercentage}
        strokeWidth={3}
        styles={buildStyles({
          pathColor: timerColor,
          trailColor: 'rgba(226, 232, 240, 0.2)',
          textSize: '0px',
          pathTransitionDuration: 0.3,
          rotation: 0.25,
          strokeLinecap: 'butt',
          backgroundColor: 'transparent',
        })}
        aria-hidden="true"
      />
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
        <div 
          className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-foreground"
          aria-label={`${formattedTime} elapsed`}
        >
          {formattedTime}
        </div>
        {category && (
          <div 
            className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-medium opacity-80 mt-1 text-center max-w-24 truncate"
            title={category}
            aria-label={`Category: ${category}`}
          >
            {category}
          </div>
        )}
      </div>
      
      {sessionCount > 1 && (
        <Badge 
          variant="secondary" 
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-secondary/80 backdrop-blur-sm text-xs px-2 py-1 shadow-sm"
          aria-label={`${sessionCount} sessions completed`}
        >
          {sessionCount} sessions
        </Badge>
      )}

      <style>
        {`
          @keyframes subtle-pulse {
            0% {
              filter: drop-shadow(0 0 2px ${timerColor});
              transform: scale(1);
            }
            50% {
              filter: drop-shadow(0 0 8px ${timerColor});
              transform: scale(1.02);
            }
            100% {
              filter: drop-shadow(0 0 2px ${timerColor});
              transform: scale(1);
            }
          }
          
          .timer-pulsing {
            animation: subtle-pulse 2s infinite ease-in-out;
          }
        `}
      </style>
    </div>
  );
};

export default TimerDisplay;
