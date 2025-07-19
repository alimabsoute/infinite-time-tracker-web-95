
import React, { useState } from "react";
import { useTimers } from "../hooks/useTimers";
import PageLayout from "../components/layout/PageLayout";
import TimerList from "../components/TimerList";
import CreateTimerForm from "../components/CreateTimerForm";
import EnhancedAnimationManager from "../components/animations/EnhancedAnimationManager";
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
    calculateSessionElapsedTime,
  } = useTimers();
  
  const [newTimerId, setNewTimerId] = useState<string | null>(null);

  console.log('📊 Index - Timer state:', { 
    count: timers.length, 
    running: timers.filter(t => t.isRunning).length,
    loading 
  });

  const handleAddTimer = async (name: string) => {
    console.log('🎯 Index - Creating timer with name:', name);
    const id = await addTimer(name);
    if (id) {
      setNewTimerId(id);
      setTimeout(() => setNewTimerId(null), 3000);
      console.log('✅ Index - Timer created successfully with ID:', id);
    } else {
      console.error('❌ Index - Failed to create timer');
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
          calculateSessionElapsedTime={calculateSessionElapsedTime}
          newTimerId={newTimerId}
          onCreateTimer={() => handleAddTimer("New Timer")}
        />
        
        <CreateTimerForm 
          onAddTimer={handleAddTimer} 
          currentTimerCount={timers.length}
        />
      </div>
      
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

export default Index;
