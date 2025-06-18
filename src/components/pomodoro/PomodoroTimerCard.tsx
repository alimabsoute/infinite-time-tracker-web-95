
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

// Enhanced color processing for Pomodoro cards
const processPomodoroColor = (rawColor: string, phase: string): {
  primaryBorder: string;
  secondaryBorder: string;
  backgroundFill: string;
  shadowColor: string;
} => {
  console.log('🍅 Processing Pomodoro color for phase:', phase, 'Raw color:', rawColor);
  
  // Extract HSL values
  const hslMatch = rawColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  
  if (hslMatch) {
    const [, h, s, l] = hslMatch;
    const hue = parseInt(h);
    const saturation = parseInt(s);
    const lightness = parseInt(l);
    
    console.log('🔧 Parsed Pomodoro HSL values:', { hue, saturation, lightness });
    
    // Create vibrant colors suitable for rectangular cards
    const primaryBorder = `hsl(${hue}, ${Math.max(85, saturation)}%, ${Math.min(55, Math.max(45, lightness))}%)`;
    const secondaryBorder = `hsl(${hue}, ${Math.max(65, saturation)}%, ${Math.min(65, Math.max(50, lightness))}%)`;
    const backgroundFill = `hsla(${hue}, ${Math.max(35, saturation - 25)}%, ${Math.min(96, lightness + 45)}%, 0.92)`;
    const shadowColor = `hsl(${hue}, ${Math.max(75, saturation)}%, ${Math.max(35, lightness - 15)}%)`;
    
    const result = {
      primaryBorder,
      secondaryBorder,
      backgroundFill,
      shadowColor
    };
    
    console.log('✅ Processed Pomodoro colors:', result);
    return result;
  }
  
  // Fallback colors for Pomodoro
  console.log('⚠️ Pomodoro color parsing failed, using fallback');
  return {
    primaryBorder: '#DC2626',
    secondaryBorder: '#F87171',
    backgroundFill: 'rgba(220, 38, 38, 0.08)',
    shadowColor: '#B91C1C'
  };
};

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
  const rawTimerColor = phaseData.color;

  console.log('🔍 PomodoroTimerCard render - Phase:', currentPhase, 'Active:', isActive);
  console.log('🎨 Raw Pomodoro color:', rawTimerColor);

  const progressPercentage = currentSession && remainingTime > 0
    ? ((currentSession.duration - remainingTime) / currentSession.duration) * 100
    : 0;

  // Process colors with enhanced logic
  const colors = processPomodoroColor(rawTimerColor, currentPhase);

  // Enhanced style objects for rectangular Pomodoro cards
  const primaryBorderStyle: React.CSSProperties = {
    border: `4px solid ${colors.primaryBorder}`,
    borderRadius: '12px',
    boxShadow: `
      0 0 0 1px ${colors.primaryBorder}, 
      0 4px 20px ${colors.shadowColor}40, 
      inset 0 0 20px ${colors.shadowColor}20,
      0 8px 32px ${colors.shadowColor}30
    `,
    background: `linear-gradient(135deg, ${colors.shadowColor}10, transparent 70%)`
  };

  const innerContentStyle: React.CSSProperties = {
    backgroundColor: colors.backgroundFill,
    backdropFilter: 'blur(10px)',
    border: `2px solid ${colors.secondaryBorder}60`,
    borderRadius: '8px',
    boxShadow: `inset 0 0 30px ${colors.shadowColor}20`
  };

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
      {/* Main rectangular card container with enhanced borders */}
      <div className="relative w-full h-full transition-all duration-300 ease-in-out group-hover:scale-95">
        
        {/* Primary border layer with enhanced styling */}
        <div 
          className={`absolute inset-0 transition-all duration-300 ease-in-out ${isActive ? 'timer-running-animation' : ''}`}
          style={primaryBorderStyle}
        />
        
        {/* Inner content container */}
        <div 
          className="absolute inset-2 transition-all duration-300 ease-in-out"
          style={innerContentStyle}
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
                    style={{ 
                      backgroundColor: colors.primaryBorder,
                      boxShadow: `0 0 8px ${colors.shadowColor}60`
                    }}
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
                timerColor={colors.primaryBorder}
                phaseLabel={phaseData.label}
              />
            </div>
            
            <div className="space-y-4 w-full">
              {/* Timer Controls */}
              <PomodoroControls
                isActive={isActive}
                sessionCount={sessionCount}
                timerColor={colors.primaryBorder}
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
            timerColor={colors.primaryBorder}
          />
        </div>
      </div>
      
      {/* Debug border for development */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="absolute inset-4 pointer-events-none z-50"
          style={{
            border: '2px dashed rgba(255, 165, 0, 0.4)',
            borderRadius: '12px'
          }}
        />
      )}
    </article>
  );
};

export default PomodoroTimerCard;
