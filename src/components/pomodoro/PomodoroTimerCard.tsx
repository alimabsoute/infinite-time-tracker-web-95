
import React from 'react';
import { PomodoroState } from '@/types/pomodoro';
import { usePomodoroPhaseData } from './PomodoroPhaseDisplay';
import { processPomodoroColor } from '@/utils/pomodoroColorProcessor';
import PomodoroCardContainer from './PomodoroCardContainer';
import PomodoroTimerHeader from './PomodoroTimerHeader';
import PomodoroTimerContent from './PomodoroTimerContent';
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
  const rawTimerColor = phaseData.color;

  console.log('🔍 PomodoroTimerCard render - Phase:', currentPhase, 'Active:', isActive);
  console.log('🎨 Raw Pomodoro color:', rawTimerColor);

  const progressPercentage = currentSession && remainingTime > 0
    ? ((currentSession.duration - remainingTime) / currentSession.duration) * 100
    : 0;

  // Process colors with enhanced logic
  const colors = processPomodoroColor(rawTimerColor, currentPhase);

  return (
    <PomodoroCardContainer
      phaseLabel={phaseData.label}
      isActive={isActive}
      colors={colors}
      className={className}
    >
      {/* Header */}
      <PomodoroTimerHeader
        phaseLabel={phaseData.label}
        sessionCount={sessionCount}
        isActive={isActive}
        colors={colors}
      />

      {/* Main Timer Content */}
      <PomodoroTimerContent
        progressPercentage={progressPercentage}
        remainingTime={remainingTime}
        isActive={isActive}
        colors={colors}
        phaseLabel={phaseData.label}
        sessionCount={sessionCount}
        currentPhase={currentPhase}
        totalSessions={totalSessions}
        onStartWork={onStartWork}
        onStartBreak={onStartBreak}
        onStop={onStop}
      />
      
      {/* Running indicator pulse */}
      <PomodoroPulseIndicator
        isActive={isActive}
        timerColor={colors.primaryBorder}
      />
    </PomodoroCardContainer>
  );
};

export default PomodoroTimerCard;
