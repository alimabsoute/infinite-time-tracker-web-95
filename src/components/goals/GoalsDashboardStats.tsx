
import React from 'react';
import PomodoroStats from '@/components/pomodoro/PomodoroStats';
import { Timer as TimerType } from '@/types';

interface GoalsDashboardStatsProps {
  timers: TimerType[];
}

const GoalsDashboardStats: React.FC<GoalsDashboardStatsProps> = ({ timers }) => {
  return (
    <div className="space-y-6">
      <PomodoroStats timers={timers} />
    </div>
  );
};

export default GoalsDashboardStats;
