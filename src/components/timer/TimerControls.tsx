
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
    <div className="flex justify-center items-center mt-1">
      <Button
        onClick={onToggle}
        variant="outline"
        size="icon"
        className="rounded-full h-10 w-10 border-2 hover:bg-secondary/30 shadow-none relative"
        style={{
          borderColor: timerColor || 'hsl(var(--primary))',
          backgroundColor: isRunning ? `${timerColor}20` : 'transparent',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        {isRunning ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </Button>
      
      <Button
        onClick={onReset}
        variant="ghost"
        size="icon"
        className="text-xs text-muted-foreground hover:text-foreground hover:bg-transparent h-6 w-6 p-0 ml-2"
        title="Reset Timer"
      >
        <RefreshCw size={14} />
      </Button>
    </div>
  );
};

export default TimerControls;
