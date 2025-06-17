
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
        className="text-4xl font-bold tracking-tight text-white leading-tight mb-2"
        style={{ textShadow: `0 2px 8px ${timerColor}80` }}
        aria-label={`${formattedTime} elapsed`}
      >
        {formattedTime}
      </div>
      
      {/* Category label */}
      {category && (
        <div 
          className="text-sm text-gray-200 uppercase tracking-wider font-medium opacity-90"
          title={category}
          aria-label={`Category: ${category}`}
        >
          {category}
        </div>
      )}

      <style>
        {`
          @keyframes text-pulse {
            0% {
              text-shadow: 0 2px 8px ${timerColor}80;
            }
            50% {
              text-shadow: 0 4px 16px ${timerColor}100, 0 0 20px ${timerColor}60;
            }
            100% {
              text-shadow: 0 2px 8px ${timerColor}80;
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
