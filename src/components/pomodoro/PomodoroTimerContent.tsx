
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
    <div className="w-full h-full flex flex-col items-center justify-center relative p-8" role="region" aria-label="Pomodoro timer content">
      {/* Timer Display - positioned in upper center */}
      <div className="absolute top-16">
        <PomodoroCircularProgress
          progressPercentage={progressPercentage}
          remainingTime={remainingTime}
          isActive={isActive}
          timerColor={colors.primaryBorder}
          phaseLabel={phaseLabel}
        />
      </div>
      
      {/* Controls - positioned in center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <PomodoroControls
          isActive={isActive}
          sessionCount={sessionCount}
          timerColor={colors.primaryBorder}
          onStartWork={onStartWork}
          onStartBreak={onStartBreak}
          onStop={onStop}
        />
      </div>
      
      {/* Metadata - positioned at bottom */}
      <div className="absolute bottom-16">
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
