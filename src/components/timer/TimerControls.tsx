
import { RefreshCw, Play, Pause } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface TimerControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
}

const TimerControls = ({ isRunning, onToggle, onReset }: TimerControlsProps) => {
  return (
    <div className="flex flex-col space-y-3 items-center">
      <Button
        onClick={onToggle}
        variant="outline"
        size="icon"
        className="rounded-full h-14 w-14 border-2 hover:bg-secondary/50 shadow-sm"
      >
        {isRunning ? <Pause size={30} /> : <Play size={30} className="ml-1" />}
      </Button>
      
      <Button
        onClick={onReset}
        variant="ghost"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        <RefreshCw size={14} className="mr-1"/> Reset
      </Button>
    </div>
  );
};

export default TimerControls;
