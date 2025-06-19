
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { useTimers } from '@/hooks/useTimers';
import { usePomodoro } from '@/hooks/usePomodoro';
import GoalsDashboardHeader from '@/components/goals/GoalsDashboardHeader';
import GoalsStatusIndicator from '@/components/goals/GoalsStatusIndicator';
import GoalsDashboardStats from '@/components/goals/GoalsDashboardStats';
import GoalsDashboardTabs from '@/components/goals/GoalsDashboardTabs';
import CreateTimerModal from '@/components/goals/CreateTimerModal';

const Goals = () => {
  const { timers, loading, toggleTimer } = useTimers();
  const { pomodoroState, saveSettings } = usePomodoro();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateTimer = () => {
    setShowCreateForm(true);
  };

  const handleCloseModal = () => {
    setShowCreateForm(false);
  };

  const handleAddTimer = async (name: string) => {
    // The form will handle timer creation
    setShowCreateForm(false);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Pomodoro Dashboard"
      description="Focus and productivity with the Pomodoro technique"
      actions={<GoalsDashboardHeader onCreateTimer={handleCreateTimer} />}
    >
      {/* Global Pomodoro Status Indicator */}
      <GoalsStatusIndicator timers={timers} />

      <div className="space-y-6">
        {/* Dashboard Stats */}
        <GoalsDashboardStats timers={timers} />

        {/* Main Content */}
        <GoalsDashboardTabs
          timers={timers}
          settings={pomodoroState.settings}
          onToggleTimer={toggleTimer}
          onCreateTimer={handleCreateTimer}
          onSettingsChange={saveSettings}
        />

        {/* Create Timer Modal */}
        <CreateTimerModal
          isOpen={showCreateForm}
          onClose={handleCloseModal}
          onAddTimer={handleAddTimer}
          currentTimerCount={timers.length}
        />
      </div>
    </PageLayout>
  );
};

export default Goals;
