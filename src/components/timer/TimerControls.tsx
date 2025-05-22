
import { RefreshCw, Play, Pause } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface TimerControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  timerColor?: string;
}

const TimerControls = ({ 
  isRunning, 
  onToggle, 
  onReset, 
  timerColor 
}: TimerControlsProps) => {
  return (
    <div className="flex justify-center gap-4 items-center mt-2">
      <Button
        onClick={onToggle}
        variant="outline"
        size="icon"
        className="rounded-full h-12 w-12 border border-transparent hover:bg-secondary/50 shadow-none"
        style={{
          borderColor: timerColor ? `${timerColor}30` : undefined, // Add slight border with timer color
        }}
      >
        {isRunning ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
      </Button>
      
      <Button
        onClick={onReset}
        variant="ghost"
        size="sm"
        className="text-sm text-muted-foreground hover:text-foreground hover:bg-transparent"
      >
        <RefreshCw size={14} className="mr-1"/> Reset
      </Button>
    </div>
  );
};

export default TimerControls;
