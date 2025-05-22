
import { RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface TimerControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
}

const TimerControls = ({ isRunning, onToggle, onReset }: TimerControlsProps) => {
  return (
    <div className="flex flex-col space-y-1 items-center">
      <div className="flex gap-2 w-full">
        <Button
          onClick={onToggle}
          className={cn(
            "w-full h-10 text-sm",
            isRunning 
              ? "bg-amber-500/80 hover:bg-amber-500 text-amber-950" 
              : "bg-emerald-500/80 hover:bg-emerald-500 text-emerald-950"
          )}
        >
          {isRunning ? 'Pause' : 'Start'}
        </Button>
      </div>
      
      <Button
        onClick={onReset}
        variant="outline"
        className="w-full h-9 text-sm bg-secondary/20"
      >
        <RefreshCw size={14} className="mr-1"/> Reset
      </Button>
    </div>
  );
};

export default TimerControls;
