
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { useTimers } from '@/hooks/useTimers';
import { usePomodoro } from '@/hooks/usePomodoro';
import { Button } from '@/components/ui/button';
import { Plus, Settings, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PomodoroGrid from '@/components/pomodoro/PomodoroGrid';
import PomodoroStats from '@/components/pomodoro/PomodoroStats';
import PomodoroSettingsComponent from '@/components/pomodoro/PomodoroSettings';
import PomodoroStatusIndicator from '@/components/pomodoro/PomodoroStatusIndicator';
import CreateTimerForm from '@/components/CreateTimerForm';

const Goals = () => {
  const { timers, loading, toggleTimer } = useTimers();
  const { pomodoroState, saveSettings } = usePomodoro();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Map timers to the format expected by PomodoroStatusIndicator
  const timerData = timers.map(timer => ({
    id: timer.id,
    name: timer.name,
    isRunning: timer.isRunning
  }));

  const handleCreateTimer = () => {
    setShowCreateForm(true);
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
      actions={
        <Button onClick={handleCreateTimer}>
          <Plus className="h-4 w-4 mr-2" />
          New Timer
        </Button>
      }
    >
      {/* Global Pomodoro Status Indicator */}
      <PomodoroStatusIndicator timers={timerData} />

      <div className="space-y-6">
        {/* Dashboard Stats */}
        <PomodoroStats timers={timers} />

        {/* Main Content */}
        <Tabs defaultValue="timers" className="w-full">
          <TabsList>
            <TabsTrigger value="timers">Pomodoro Timers</TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Pomodoro Timers</h2>
              {timers.length > 0 && (
                <Button variant="outline" onClick={handleCreateTimer}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Timer
                </Button>
              )}
            </div>
            
            <PomodoroGrid
              timers={timers}
              onToggleTimer={toggleTimer}
              onCreateTimer={handleCreateTimer}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Analytics Coming Soon</h3>
              <p className="text-muted-foreground">
                Detailed Pomodoro analytics and insights will be available here
              </p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <PomodoroSettingsComponent
              settings={pomodoroState.settings}
              onSettingsChange={saveSettings}
            />
          </TabsContent>
        </Tabs>

        {/* Create Timer Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <CreateTimerForm 
                onAddTimer={async (name: string) => {
                  // The form will handle timer creation
                  setShowCreateForm(false);
                }} 
                currentTimerCount={timers.length}
              />
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                className="mt-4 w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Goals;
