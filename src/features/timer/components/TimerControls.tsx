import { RefreshCw, Play, Pause } from 'lucide-react';
import { Button } from '@shared/components/ui/button';

interface TimerControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  timerColor?: string;
}

const TimerControls = ({ isRunning, onToggle, onReset, timerColor }: TimerControlsProps) => {
  const color = timerColor || 'hsl(var(--primary))';
  return (
    <div className="flex justify-center items-center gap-3">
      <Button
        onClick={onToggle}
        variant="outline"
        size="icon"
        className="rounded-full h-12 w-12 border-2 hover:scale-110 shadow-md transition-all duration-200"
        style={{
          borderColor: color,
          backgroundColor: isRunning ? `${color}20` : 'hsl(var(--card))',
          color,
        }}
      >
        {isRunning ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
      </Button>

      <Button
        onClick={onReset}
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground hover:bg-muted h-8 w-8 p-0 transition-all duration-200 rounded-full"
        title="Reset Timer"
      >
        <RefreshCw size={16} />
      </Button>
    </div>
  );
};

export default TimerControls;
