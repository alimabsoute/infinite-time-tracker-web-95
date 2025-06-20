
import React from 'react';
import { useTimers } from '../hooks/useTimers';
import PageLayout from '../components/layout/PageLayout';
import ActiveTimersList from '../components/active-timers/ActiveTimersList';
import { Timer } from '../types';

const ActiveTimers = () => {
  const { timers, loading, toggleTimer, resetTimer } = useTimers();

  // Filter for active (running) timers
  const activeTimers = timers.filter(timer => timer.isRunning);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen py-6 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Active Timers</h1>
              <p className="text-gray-600 mt-1">
                {activeTimers.length}/{timers.length} Free
              </p>
            </div>
          </div>

          {/* Active Timers List */}
          <ActiveTimersList 
            timers={activeTimers}
            onToggle={toggleTimer}
            onReset={resetTimer}
          />

          {/* Empty State */}
          {activeTimers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">No active timers</div>
              <div className="text-gray-500">Start a timer from the dashboard to see it here</div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ActiveTimers;
