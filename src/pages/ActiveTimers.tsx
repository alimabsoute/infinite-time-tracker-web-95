
import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import { useTimers } from '../hooks/useTimers';
import ActiveTimersList from '../components/active-timers/ActiveTimersList';

const ActiveTimers = () => {
  const { timers, toggleTimer, resetTimer } = useTimers();
  const activeTimers = timers.filter(timer => timer.isRunning);

  return (
    <PageLayout 
      title="Active Timers"
      description="All currently running timers"
    >
      {activeTimers.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-2">No active timers</p>
            <p className="text-gray-500">Start some timers to see them here!</p>
          </div>
        </div>
      ) : (
        <ActiveTimersList
          timers={activeTimers}
          onToggle={toggleTimer}
          onReset={resetTimer}
        />
      )}
    </PageLayout>
  );
};

export default ActiveTimers;
