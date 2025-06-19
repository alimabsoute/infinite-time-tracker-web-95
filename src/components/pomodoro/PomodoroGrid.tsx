
import React from 'react';
import { Timer as TimerType } from '@/types';
import PomodoroTimer from './PomodoroTimer';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PomodoroGridProps {
  timers: TimerType[];
  onToggleTimer: (id: string) => void;
  onCreateTimer: () => void;
}

const PomodoroGrid: React.FC<PomodoroGridProps> = ({
  timers,
  onToggleTimer,
  onCreateTimer
}) => {
  if (timers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
              🍅
            </div>
            <h3 className="mt-2 text-lg font-medium">No timers available</h3>
            <p className="mt-1 text-muted-foreground">
              Create your first timer to start using the Pomodoro technique
            </p>
            <Button className="mt-4" onClick={onCreateTimer}>
              <Plus className="h-4 w-4 mr-2" />
              Create Timer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {timers.map(timer => (
        <PomodoroTimer
          key={timer.id}
          timerId={timer.id}
          isTimerRunning={timer.isRunning}
          onTimerToggle={() => onToggleTimer(timer.id)}
        />
      ))}
    </div>
  );
};

export default PomodoroGrid;
