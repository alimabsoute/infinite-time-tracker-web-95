
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
    <div className="flex justify-center items-center">
      <Button
        onClick={onToggle}
        variant="outline"
        size="icon"
        className="rounded-full h-9 w-9 border-2 hover:bg-background/50 shadow-none relative transition-all duration-200"
        style={{
          borderColor: timerColor || 'hsl(var(--primary))',
          backgroundColor: isRunning ? `${timerColor}10` : 'transparent',
          color: timerColor || 'hsl(var(--primary))'
        }}
      >
        {isRunning ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </Button>
      
      <Button
        onClick={onReset}
        variant="ghost"
        size="icon"
        className="text-xs text-muted-foreground hover:text-foreground hover:bg-background/30 h-6 w-6 p-0 ml-2 transition-colors duration-200"
        title="Reset Timer"
      >
        <RefreshCw size={12} />
      </Button>
    </div>
  );
};

export default TimerControls;
