
import { formatTime } from '../../utils/timerUtils';

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
  category,
  timerColor = 'hsl(221, 83%, 53%)' 
}: TimerDisplayProps) => {
  const formattedTime = formatTime(currentTime);

  return (
    <div 
      className={`text-center ${isRunning ? 'timer-pulsing' : ''}`}
      role="timer"
      aria-label={`Timer showing ${formattedTime}${category ? ` for ${category}` : ''}`}
      aria-live={isRunning ? "polite" : "off"}
      tabIndex={0}
    >
      {/* Large time display */}
      <div 
        className="text-3xl font-bold tracking-tight text-gray-800 leading-tight"
        style={{ textShadow: `0 2px 8px ${timerColor}40` }}
        aria-label={`${formattedTime} elapsed`}
      >
        {formattedTime}
      </div>

      <style>
        {`
          @keyframes text-pulse {
            0% {
              text-shadow: 0 2px 8px ${timerColor}40;
            }
            50% {
              text-shadow: 0 4px 16px ${timerColor}60, 0 0 20px ${timerColor}30;
            }
            100% {
              text-shadow: 0 2px 8px ${timerColor}40;
            }
          }
          
          .timer-pulsing {
            animation: text-pulse 2s infinite ease-in-out;
          }
        `}
      </style>
    </div>
  );
};

export default TimerDisplay;
