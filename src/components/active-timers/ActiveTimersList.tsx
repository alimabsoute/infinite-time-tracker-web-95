
import React from 'react';
import { Timer } from '../../types';
import ActiveTimerCard from './ActiveTimerCard';

interface ActiveTimersListProps {
  timers: Timer[];
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
}

const ActiveTimersList: React.FC<ActiveTimersListProps> = ({
  timers,
  onToggle,
  onReset
}) => {
  return (
    <div className="space-y-4">
      {timers.map((timer) => (
        <ActiveTimerCard
          key={timer.id}
          timer={timer}
          onToggle={onToggle}
          onReset={onReset}
        />
      ))}
    </div>
  );
};

export default ActiveTimersList;
