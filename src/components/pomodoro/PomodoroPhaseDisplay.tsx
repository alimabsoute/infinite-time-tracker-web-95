
import React from 'react';
import { Coffee, Zap, Play } from 'lucide-react';

interface PomodoroPhaseDisplayProps {
  currentPhase: 'work' | 'short-break' | 'long-break' | 'idle';
}

const PomodoroPhaseDisplay: React.FC<PomodoroPhaseDisplayProps> = ({ currentPhase }) => {
  const getPhaseIcon = () => {
    switch (currentPhase) {
      case 'work':
        return <Zap className="h-4 w-4" />;
      case 'short-break':
      case 'long-break':
        return <Coffee className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getPhaseLabel = () => {
    switch (currentPhase) {
      case 'work':
        return 'Work Session';
      case 'short-break':
        return 'Short Break';
      case 'long-break':
        return 'Long Break';
      default:
        return 'Ready';
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'work':
        return '#ef4444'; // red-500
      case 'short-break':
        return '#10b981'; // green-500
      case 'long-break':
        return '#3b82f6'; // blue-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  return {
    icon: getPhaseIcon(),
    label: getPhaseLabel(),
    color: getPhaseColor()
  };
};

export default PomodoroPhaseDisplay;
