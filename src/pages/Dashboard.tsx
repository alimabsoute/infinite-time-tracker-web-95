
import React, { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { useTimers } from '../hooks/useTimers';
import { useTimerSessions } from '../hooks/useTimerSessions';
import TimerList from '../components/TimerList';
import CreateTimerForm from '../components/CreateTimerForm';
import EnhancedAnimationManager from '../components/animations/EnhancedAnimationManager';

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
    addTimer,
    confettiTrigger,
    celebrationTrigger,
    clearConfettiTrigger,
    clearCelebrationTrigger,
  } = useTimers();
  const { sessions, loading: sessionsLoading } = useTimerSessions();
  const [newTimerId, setNewTimerId] = useState<string | null>(null);

  // Enhanced debug logging
  React.useEffect(() => {
    if (confettiTrigger || celebrationTrigger.type) {
      console.log('🚀 Dashboard - Animation triggers active:', {
        confetti: !!confettiTrigger,
        celebration: celebrationTrigger.type,
        timersCount: timers.length
      });
    }
  }, [confettiTrigger, celebrationTrigger.type, timers.length]);

  // Create a wrapper function that matches the expected signature
  const handleCreateTimer = async (name: string) => {
    console.log('🎯 Dashboard - Creating timer with name:', name);
    const id = await addTimer(name);
    if (id) {
      setNewTimerId(id);
      setTimeout(() => setNewTimerId(null), 3000);
      console.log('✅ Dashboard - Timer created successfully with ID:', id);
    } else {
      console.error('❌ Dashboard - Failed to create timer');
    }
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
          newTimerId={newTimerId}
          onCreateTimer={() => handleCreateTimer("New Timer")}
        />
      </div>

      {/* Floating Create Timer Button */}
      <CreateTimerForm 
        onAddTimer={handleCreateTimer}
        currentTimerCount={timers.length}
      />

      {/* Enhanced Animation Manager - Centralized control */}
      <EnhancedAnimationManager
        confettiTrigger={confettiTrigger}
        celebrationTrigger={celebrationTrigger}
        onConfettiComplete={clearConfettiTrigger}
        onCelebrationComplete={clearCelebrationTrigger}
      />
    </PageLayout>
  );
};

export default Dashboard;
