
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

  const progressPercentage = currentSession && remainingTime > 0
    ? ((currentSession.duration - remainingTime) / currentSession.duration) * 100
    : 0;

  return (
    <div 
      className={cn(
        'relative w-full max-w-[260px] mx-auto transition-all duration-200 hover:scale-[1.02]',
        className
      )}
      style={{
        borderRadius: "8px", 
        border: `2px solid ${timerColor}`,
        background: 'transparent',
        boxShadow: isActive 
          ? `0 0 0 1px ${timerColor}, 0 0 16px ${timerColor}50, 0 2px 12px rgba(0, 0, 0, 0.1)` 
          : `0 0 0 1px ${timerColor}90, 0 1px 6px rgba(0, 0, 0, 0.06)`,
      }}
    >
      <div className="p-2 rounded-[6px]">
        <div className="flex flex-col space-y-1">
          {/* Timer Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {phaseData.icon}
              <span className="font-medium text-sm">Pomodoro</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs h-4 px-1">
                🍅 {sessionCount}
              </Badge>
              {isActive && (
                <div 
                  className="w-2 h-2 rounded-full animate-pulse" 
                  style={{ backgroundColor: timerColor }}
                />
              )}
            </div>
          </div>

          {/* Timer Content */}
          <div className="space-y-1.5">
            {/* Timer Display */}
            <div className="flex items-center justify-center">
              <PomodoroCircularProgress
                progressPercentage={progressPercentage}
                remainingTime={remainingTime}
                isActive={isActive}
                timerColor={timerColor}
                phaseLabel={phaseData.label}
              />
            </div>
            
            <div className="space-y-1.5">
              {/* Timer Controls */}
              <PomodoroControls
                isActive={isActive}
                sessionCount={sessionCount}
                timerColor={timerColor}
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
            timerColor={timerColor}
          />
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimerCard;
