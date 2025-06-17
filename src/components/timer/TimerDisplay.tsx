
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
  const progressPercentage = Math.min(100, (currentTime / 3600000) * 100);
  const formattedTime = formatTime(currentTime);

  return (
    <div 
      className={`w-28 h-28 relative mx-auto ${
        isRunning ? 'timer-pulsing' : ''
      }`}
      role="timer"
      aria-label={`Timer showing ${formattedTime}${category ? ` for ${category}` : ''}`}
      aria-live={isRunning ? "polite" : "off"}
      tabIndex={0}
    >
      <CircularProgressbar
        value={progressPercentage}
        strokeWidth={4}
        styles={buildStyles({
          pathColor: timerColor,
          trailColor: `${timerColor}20`,
          textSize: '0px',
          pathTransitionDuration: 0.3,
          rotation: 0.25,
          strokeLinecap: 'round',
          backgroundColor: 'transparent',
        })}
        aria-hidden="true"
      />
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
        <div 
          className="text-lg font-bold tracking-tight text-foreground"
          aria-label={`${formattedTime} elapsed`}
        >
          {formattedTime}
        </div>
        {category && (
          <div 
            className="text-xs text-muted-foreground uppercase tracking-wider font-medium opacity-70 mt-0.5 text-center max-w-20 truncate"
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
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-secondary/80 backdrop-blur-sm text-xs px-1.5 py-0.5 shadow-sm"
          aria-label={`${sessionCount} sessions completed`}
        >
          {sessionCount}
        </Badge>
      )}

      <style>
        {`
          @keyframes subtle-pulse {
            0% {
              filter: drop-shadow(0 0 4px ${timerColor});
              transform: scale(1);
            }
            50% {
              filter: drop-shadow(0 0 12px ${timerColor});
              transform: scale(1.02);
            }
            100% {
              filter: drop-shadow(0 0 4px ${timerColor});
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
