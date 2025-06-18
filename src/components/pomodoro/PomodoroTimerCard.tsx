
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PomodoroState } from '@/types/pomodoro';
import PomodoroCircularProgress from './PomodoroCircularProgress';
import { usePomodoroPhaseData } from './PomodoroPhaseDisplay';
import PomodoroControls from './PomodoroControls';
import PomodoroMetadata from './PomodoroMetadata';
import PomodoroPulseIndicator from './PomodoroPulseIndicator';

interface PomodoroTimerCardProps {
  pomodoroState: PomodoroState;
  remainingTime: number;
  onStartWork: () => void;
  onStartBreak: () => void;
  onStop: () => void;
  onReset: () => void;
  className?: string;
}

const PomodoroTimerCard: React.FC<PomodoroTimerCardProps> = ({
  pomodoroState,
  remainingTime,
  onStartWork,
  onStartBreak,
  onStop,
  onReset,
  className
}) => {
  const { isActive, currentSession, currentPhase, sessionCount, totalSessions } = pomodoroState;

  const phaseData = usePomodoroPhaseData(currentPhase);
  const timerColor = phaseData.color;

  console.log('🎨 Timer color for phase:', currentPhase, timerColor);
  console.log('🔍 Debug - Timer card render with active state:', isActive);
  console.log('🎯 Debug - Phase data:', phaseData);

  const progressPercentage = currentSession && remainingTime > 0
    ? ((currentSession.duration - remainingTime) / currentSession.duration) * 100
    : 0;

  // Convert HSL color to a solid RGB value for better border visibility
  const getSolidBorderColor = (color: string) => {
    console.log('🔧 Converting color to solid border:', color);
    // Extract HSL values and create a solid color
    const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
      const [, h, s, l] = hslMatch;
      // Use full saturation and medium lightness for strong border
      const solidColor = `hsl(${h}, 80%, 50%)`;
      console.log('🎨 Generated solid border color:', solidColor);
      return solidColor;
    }
    // Fallback to bright blue if parsing fails
    console.log('⚠️ Color parsing failed, using fallback');
    return '#3B82F6';
  };

  // Get lighter pastel color for inner fill
  const getInnerFillColor = (color: string) => {
    const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
      const [, h, s, l] = hslMatch;
      return `hsla(${h}, ${Math.max(25, parseInt(s) - 40)}%, ${Math.min(92, parseInt(l) + 35)}%, 0.9)`;
    }
    return 'rgba(255, 255, 255, 0.9)';
  };

  const solidBorderColor = getSolidBorderColor(timerColor);
  const innerFillColor = getInnerFillColor(timerColor);

  console.log('🎨 Final colors - Border:', solidBorderColor, 'Inner:', innerFillColor);

  return (
    <article 
      className={cn(
        'relative group w-full max-w-[320px] h-[280px] mx-auto flex-shrink-0 p-4 transition-all duration-300 ease-in-out hover:scale-95',
        className
      )}
      role="region"
      aria-label={`Pomodoro timer - ${phaseData.label}`}
      tabIndex={0}
      style={{
        minWidth: '320px',
        minHeight: '280px'
      }}
    >
      {/* Main rectangular card container with strong border */}
      <div className="relative w-full h-full transition-all duration-300 ease-in-out group-hover:scale-95">
        {/* Strong solid border with rounded corners */}
        <div 
          className="absolute inset-0 rounded-xl transition-all duration-300 ease-in-out"
          style={{
            border: `4px solid ${solidBorderColor}`,
            boxShadow: `
              0 0 0 1px ${solidBorderColor}, 
              0 4px 20px ${solidBorderColor}40, 
              inset 0 0 20px ${solidBorderColor}20,
              0 8px 32px ${solidBorderColor}30
            `,
            background: `linear-gradient(135deg, ${solidBorderColor}10, transparent 70%)`,
            zIndex: 1
          }}
        />
        
        {/* Inner content container with clear background */}
        <div 
          className="absolute inset-2 rounded-lg transition-all duration-300 ease-in-out"
          style={{
            backgroundColor: innerFillColor,
            backdropFilter: 'blur(10px)',
            border: `2px solid ${solidBorderColor}60`,
            boxShadow: `inset 0 0 30px ${solidBorderColor}20`,
            zIndex: 2
          }}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4">
            <div className="flex items-start justify-between">
              {/* Timer name and category */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-800 leading-tight truncate">
                  Pomodoro Timer
                </h3>
                <div className="text-sm text-gray-600 mt-1 truncate">
                  {phaseData.label}
                </div>
              </div>
              
              {/* Status badges */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  🍅 {sessionCount}
                </Badge>
                {isActive && (
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse" 
                    style={{ backgroundColor: solidBorderColor }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Main Timer Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 pt-16 pb-8" style={{ zIndex: 3 }}>
            {/* Timer Display */}
            <div className="flex items-center justify-center mb-6">
              <PomodoroCircularProgress
                progressPercentage={progressPercentage}
                remainingTime={remainingTime}
                isActive={isActive}
                timerColor={solidBorderColor}
                phaseLabel={phaseData.label}
              />
            </div>
            
            <div className="space-y-4 w-full">
              {/* Timer Controls */}
              <PomodoroControls
                isActive={isActive}
                sessionCount={sessionCount}
                timerColor={solidBorderColor}
                onStartWork={onStartWork}
                onStartBreak={onStartBreak}
                onStop={onStop}
              />
              
              {/* Timer Metadata */}
              <PomodoroMetadata
                currentPhase={currentPhase}
                totalSessions={totalSessions}
                phaseLabel={phaseData.label}
              />
            </div>
          </div>
          
          {/* Running indicator pulse */}
          <PomodoroPulseIndicator
            isActive={isActive}
            timerColor={solidBorderColor}
          />
        </div>
      </div>
    </article>
  );
};

export default PomodoroTimerCard;
