
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Settings, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PomodoroGrid from '@/components/pomodoro/PomodoroGrid';
import PomodoroSettingsComponent from '@/components/pomodoro/PomodoroSettings';
import { Timer as TimerType } from '@/types';
import { PomodoroSettings } from '@/types/pomodoro';

interface GoalsDashboardTabsProps {
  timers: TimerType[];
  settings: PomodoroSettings;
  onToggleTimer: (id: string) => void;
  onCreateTimer: () => void;
  onSettingsChange: (settings: PomodoroSettings) => void;
}

const GoalsDashboardTabs: React.FC<GoalsDashboardTabsProps> = ({
  timers,
  settings,
  onToggleTimer,
  onCreateTimer,
  onSettingsChange
}) => {
  return (
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
            <Button variant="outline" onClick={onCreateTimer}>
              <Plus className="h-4 w-4 mr-2" />
              Add Timer
            </Button>
          )}
        </div>
        
        <PomodoroGrid
          timers={timers}
          onToggleTimer={onToggleTimer}
          onCreateTimer={onCreateTimer}
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
          settings={settings}
          onSettingsChange={onSettingsChange}
        />
      </TabsContent>
    </Tabs>
  );
};

export default GoalsDashboardTabs;
