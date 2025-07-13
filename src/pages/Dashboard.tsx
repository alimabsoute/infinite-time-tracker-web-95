
import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import { useTimers } from '../hooks/useTimers';
import { useTimerSessions } from '../hooks/useTimerSessions';
import TimerList from '../components/TimerList';

const Dashboard = () => {
  const { 
    timers, 
    toggleTimer, 
    resetTimer, 
    deleteTimer, 
    renameTimer, 
    updateDeadline, 
    updatePriority, 
    reorderTimers,
    addTimer 
  } = useTimers();
  const { sessions, loading: sessionsLoading } = useTimerSessions();

  // Create a wrapper function that matches the expected signature
  const handleCreateTimer = () => {
    // Create a timer with a default name - the user can rename it afterward
    addTimer('New Timer');
  };

  if (sessionsLoading) {
    return (
      <PageLayout 
        title="Dashboard"
        description="Overview of your timers and recent activity"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Dashboard"
      description="Overview of your timers and recent activity"
    >
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Timers</h3>
          <p className="text-3xl font-bold text-blue-600">{timers.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Sessions</h3>
          <p className="text-3xl font-bold text-green-600">{sessions.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Active Timers</h3>
          <p className="text-3xl font-bold text-orange-600">
            {timers.filter(timer => timer.isRunning).length}
          </p>
        </div>
      </div>
      
      {/* All Timers - The Round Clocks */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-6">All Timers</h3>
        <TimerList
          timers={timers}
          onToggle={toggleTimer}
          onReset={resetTimer}
          onDelete={deleteTimer}
          onRename={renameTimer}
          onUpdateDeadline={updateDeadline}
          onUpdatePriority={updatePriority}
          onReorder={reorderTimers}
          newTimerId={null}
          onCreateTimer={handleCreateTimer}
        />
      </div>
    </PageLayout>
  );
};

export default Dashboard;
