
import React, { useState } from "react";
import { useTimers } from "../hooks/useTimers";
import PageLayout from "../components/layout/PageLayout";
import TimerList from "../components/TimerList";
import CreateTimerForm from "../components/CreateTimerForm";
import ConfettiAnimation from "../components/animations/ConfettiAnimation";
import CelebrationAnimations from "../components/animations/CelebrationAnimations";
import TimerLimitIndicator from "../components/premium/TimerLimitIndicator";
import RunningTimerLimitIndicator from "../components/premium/RunningTimerLimitIndicator";

const Index = () => {
  const {
    timers,
    loading,
    addTimer,
    toggleTimer,
    resetTimer,
    deleteTimer,
    renameTimer,
    updateDeadline,
    updatePriority,
    reorderTimers,
    confettiTrigger,
    celebrationTrigger,
    clearConfettiTrigger,
    clearCelebrationTrigger,
  } = useTimers();
  
  const [newTimerId, setNewTimerId] = useState<string | null>(null);

  const handleAddTimer = async (name: string) => {
    const id = await addTimer(name);
    if (id) {
      setNewTimerId(id);
      setTimeout(() => setNewTimerId(null), 3000);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  const runningTimers = timers.filter(t => t.isRunning);

  return (
    <PageLayout>
      <div 
        className="min-h-screen py-2"
        style={{
          background: 'rgba(243, 244, 246, 0.4)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Timer Limit Indicators */}
        <div className="container mx-auto px-4 mb-6 space-y-4">
          <TimerLimitIndicator currentCount={timers.length} />
          <RunningTimerLimitIndicator currentRunningCount={runningTimers.length} />
        </div>

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
          onCreateTimer={() => handleAddTimer("New Timer")}
        />
        
        <CreateTimerForm 
          onAddTimer={handleAddTimer} 
          currentTimerCount={timers.length}
        />
      </div>
      
      {/* Enhanced Confetti Animation */}
      {confettiTrigger && (
        <ConfettiAnimation
          x={confettiTrigger.x}
          y={confettiTrigger.y}
          onComplete={clearConfettiTrigger}
        />
      )}
      
      {/* Enhanced Celebration Animations */}
      {celebrationTrigger.type && (
        <CelebrationAnimations
          type={celebrationTrigger.type}
          onComplete={clearCelebrationTrigger}
        />
      )}
    </PageLayout>
  );
};

export default Index;
