
import React, { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { useDeadSimpleTimers } from '../hooks/useDeadSimpleTimers';
import { useAuth } from '../contexts/AuthContext';
import TimerList from '../components/TimerList';
import CreateTimerForm from '../components/CreateTimerForm';
import EnhancedAnimationManager from '../components/animations/EnhancedAnimationManager';
import TimerLimitIndicator from '../components/premium/TimerLimitIndicator';
import RunningTimerLimitIndicator from '../components/premium/RunningTimerLimitIndicator';

const Dashboard = () => {
  const { user } = useAuth();
  const {
    timers,
    toggleTimer,
    resetTimer,
    addTimer,
    deleteTimer,
    renameTimer,
    updateDeadline,
    updatePriority,
    reorderTimers,
    getDisplayTime,
    loading,
    confettiTrigger,
    celebrationTrigger,
    clearConfettiTrigger,
    clearCelebrationTrigger
  } = useDeadSimpleTimers();
  const [newTimerId, setNewTimerId] = useState<string | null>(null);

  const totalMinutes = Math.floor(
    timers.reduce((total, timer) => total + getDisplayTime(timer), 0) / 1000 / 60
  );
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const runningCount = timers.filter(t => t.isRunning).length;

  const handleCreateTimer = async (name: string, position?: { x: number; y: number }) => {
    await addTimer(name, position);
  };

  return (
    <PageLayout>
      <div id="dashboard-content">
        {/* Timer Limit Indicators */}
        <div className="mb-6 space-y-3">
          <TimerLimitIndicator currentCount={timers.length} />
          <RunningTimerLimitIndicator currentRunningCount={runningCount} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-1">Total Timers</p>
            <p className="text-2xl font-semibold font-mono">{timers.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-1">Total Time</p>
            <p className="text-2xl font-semibold font-mono">
              {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-1">Running</p>
            <p className="text-2xl font-semibold font-mono flex items-center gap-2">
              {runningCount}
              {runningCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-green-500 running-dot" />
              )}
            </p>
          </div>
        </div>

        {/* All Timers */}
        <div>
          <h3 className="text-lg font-semibold mb-4">All Timers</h3>
          <TimerList
            timers={timers}
            onToggle={toggleTimer}
            onReset={resetTimer}
            onDelete={deleteTimer}
            onRename={renameTimer}
            onUpdateDeadline={updateDeadline}
            onUpdatePriority={updatePriority}
            onReorder={reorderTimers}
            calculateSessionElapsedTime={getDisplayTime}
            newTimerId={newTimerId}
            onCreateTimer={() => handleCreateTimer("New Timer")}
          />
        </div>

        {/* Floating Create Timer Button */}
        <CreateTimerForm
          onAddTimer={handleCreateTimer}
          currentTimerCount={timers.length}
        />

        {/* Celebration Animations */}
        <EnhancedAnimationManager
          confettiTrigger={confettiTrigger}
          celebrationTrigger={celebrationTrigger}
          onConfettiComplete={clearConfettiTrigger}
          onCelebrationComplete={clearCelebrationTrigger}
        />
      </div>
    </PageLayout>
  );
};

export default Dashboard;
