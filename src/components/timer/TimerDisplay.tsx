
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
      className={`w-32 h-32 relative mx-auto ${
        isRunning ? 'timer-pulsing' : ''
      }`}
      role="timer"
      aria-label={`Timer showing ${formattedTime}${category ? ` for ${category}` : ''}`}
      aria-live={isRunning ? "polite" : "off"}
      tabIndex={0}
    >
      <div className="w-full h-full relative">
        <CircularProgressbar
          value={progressPercentage}
          strokeWidth={8}
          styles={buildStyles({
            pathColor: timerColor,
            trailColor: `${timerColor}20`,
            textSize: '0px',
            pathTransitionDuration: 0.2,
            rotation: 0.25,
            strokeLinecap: 'round',
            backgroundColor: 'transparent',
          })}
          aria-hidden="true"
        />
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
          <div 
            className="text-lg font-bold tracking-tight text-foreground leading-tight"
            aria-label={`${formattedTime} elapsed`}
          >
            {formattedTime}
          </div>
          {category && (
            <div 
              className="text-xs text-muted-foreground uppercase tracking-wider font-medium opacity-60 mt-1 text-center max-w-20 truncate"
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
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm text-xs px-2 py-1 shadow-sm border"
            style={{ borderColor: `${timerColor}40` }}
            aria-label={`${sessionCount} sessions completed`}
          >
            {sessionCount}
          </Badge>
        )}
      </div>

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
