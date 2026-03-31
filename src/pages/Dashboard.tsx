
import { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { useDeadSimpleTimers } from '../hooks/useDeadSimpleTimers';
import TimerList from '../components/TimerList';
import CreateTimerForm from '../components/CreateTimerForm';
import EnhancedAnimationManager from '../components/animations/EnhancedAnimationManager';
import TimerLimitIndicator from '../components/premium/TimerLimitIndicator';
import RunningTimerLimitIndicator from '../components/premium/RunningTimerLimitIndicator';



const Dashboard = () => {
  
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
    confettiTrigger,
    celebrationTrigger,
    clearConfettiTrigger,
    clearCelebrationTrigger
  } = useDeadSimpleTimers();
  const [newTimerId] = useState<string | null>(null);

  const handleCreateTimer = async (name: string, position?: { x: number; y: number }) => {
    await addTimer(name, position);
  };

  return (
    <PageLayout>
      <div id="dashboard-content">
        {/* Timer Limit Indicators */}
        <div className="mb-6 space-y-4">
        <TimerLimitIndicator currentCount={timers.length} />
        <RunningTimerLimitIndicator currentRunningCount={timers.filter(timer => timer.isRunning).length} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Timers</h3>
          <p className="text-3xl font-bold text-blue-600">{timers.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Running Time</h3>
          <p className="text-3xl font-bold text-green-600">
            {Math.floor(timers.reduce((total, timer) => total + getDisplayTime(timer), 0) / 1000 / 60)}m
          </p>
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

        {/* Enhanced Animation Manager */}
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
