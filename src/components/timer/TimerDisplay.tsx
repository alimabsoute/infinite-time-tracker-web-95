
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
      className={`w-40 h-40 relative mx-auto ${
        isRunning ? 'timer-pulsing' : ''
      }`}
      role="timer"
      aria-label={`Timer showing ${formattedTime}${category ? ` for ${category}` : ''}`}
      aria-live={isRunning ? "polite" : "off"}
      tabIndex={0}
    >
      {/* Outer glow ring */}
      <div 
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background: `radial-gradient(circle at center, transparent 60%, ${timerColor}20 80%, transparent 100%)`,
          filter: `drop-shadow(0 0 20px ${timerColor}40)`,
        }}
      />
      
      <div className="w-full h-full relative">
        {/* Main circular progress */}
        <CircularProgressbar
          value={progressPercentage}
          strokeWidth={6}
          styles={buildStyles({
            pathColor: timerColor,
            trailColor: `${timerColor}15`,
            textSize: '0px',
            pathTransitionDuration: 0.3,
            rotation: 0.25,
            strokeLinecap: 'round',
            backgroundColor: 'transparent',
          })}
          aria-hidden="true"
        />
        
        {/* Inner circle with dark background */}
        <div 
          className="absolute inset-3 rounded-full flex flex-col items-center justify-center border-2"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderColor: `${timerColor}30`,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div 
            className="text-2xl font-bold tracking-tight text-white leading-tight"
            aria-label={`${formattedTime} elapsed`}
          >
            {formattedTime}
          </div>
          {category && (
            <div 
              className="text-xs text-gray-300 uppercase tracking-wider font-medium opacity-80 mt-1 text-center max-w-20 truncate"
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
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-xs px-2 py-1 shadow-lg border text-white"
            style={{ borderColor: `${timerColor}60` }}
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
              filter: drop-shadow(0 0 8px ${timerColor}60);
              transform: scale(1);
            }
            50% {
              filter: drop-shadow(0 0 24px ${timerColor}80);
              transform: scale(1.02);
            }
            100% {
              filter: drop-shadow(0 0 8px ${timerColor}60);
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
