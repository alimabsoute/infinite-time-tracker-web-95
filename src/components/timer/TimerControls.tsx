
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
    <div className="flex justify-center gap-2 items-center mt-1">
      <Button
        onClick={onToggle}
        variant="outline"
        size="icon"
        className="rounded-full h-10 w-10 border border-transparent hover:bg-secondary/30 shadow-none"
        style={{
          borderColor: timerColor ? `${timerColor}40` : undefined, // Add slight border with timer color
          transition: 'all 0.2s ease-in-out'
        }}
      >
        {isRunning ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
      </Button>
      
      <Button
        onClick={onReset}
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground hover:text-foreground hover:bg-transparent px-2 py-1 h-auto"
      >
        <RefreshCw size={12} className="mr-1"/> Reset
      </Button>
    </div>
  );
};

export default TimerControls;
