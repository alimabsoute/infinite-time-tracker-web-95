
import React, { useState } from "react";
import { useTimers } from "../hooks/useTimers";
import PageLayout from "../components/layout/PageLayout";
import TimerList from "../components/TimerList";
import CreateTimerForm from "../components/CreateTimerForm";
import ConfettiAnimation from "../components/animations/ConfettiAnimation";

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
    clearConfettiTrigger,
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

  return (
    <PageLayout>
      <div 
        className="min-h-screen py-6"
        style={{
          background: 'rgba(243, 244, 246, 0.4)',
          backdropFilter: 'blur(10px)'
        }}
      >
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
      
      {/* Confetti Animation */}
      {confettiTrigger && (
        <ConfettiAnimation
          x={confettiTrigger.x}
          y={confettiTrigger.y}
          onComplete={clearConfettiTrigger}
        />
      )}
    </PageLayout>
  );
};

export default Index;
