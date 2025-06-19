
import React from 'react';
import { ProcessedPomodoroColors } from '@/utils/pomodoroColorProcessor';
import PomodoroCircularProgress from './PomodoroCircularProgress';
import PomodoroControls from './PomodoroControls';
import PomodoroMetadata from './PomodoroMetadata';

interface PomodoroTimerContentProps {
  progressPercentage: number;
  remainingTime: number;
  isActive: boolean;
  colors: ProcessedPomodoroColors;
  phaseLabel: string;
  sessionCount: number;
  currentPhase: 'work' | 'short-break' | 'long-break' | 'idle';
  totalSessions: number;
  onStartWork: () => void;
  onStartBreak: () => void;
  onStop: () => void;
}

const PomodoroTimerContent: React.FC<PomodoroTimerContentProps> = ({
  progressPercentage,
  remainingTime,
  isActive,
  colors,
  phaseLabel,
  sessionCount,
  currentPhase,
  totalSessions,
  onStartWork,
  onStartBreak,
  onStop
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 pt-16 pb-8" style={{ zIndex: 3 }}>
      {/* Timer Display */}
      <div className="flex items-center justify-center mb-6">
        <PomodoroCircularProgress
          progressPercentage={progressPercentage}
          remainingTime={remainingTime}
          isActive={isActive}
          timerColor={colors.primaryBorder}
          phaseLabel={phaseLabel}
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
          phaseLabel={phaseLabel}
        />
      </div>
    </div>
  );
};

export default PomodoroTimerContent;
