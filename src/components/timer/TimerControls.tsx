
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
    <div className="flex justify-center items-center gap-3">
      <Button
        onClick={onToggle}
        variant="outline"
        size="icon"
        className="rounded-full h-12 w-12 border-2 hover:bg-background/50 shadow-md relative transition-all duration-200"
        style={{
          borderColor: timerColor || 'hsl(var(--primary))',
          backgroundColor: isRunning ? `${timerColor}20` : 'white',
          color: timerColor || 'hsl(var(--primary))'
        }}
      >
        {isRunning ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
      </Button>
      
      <Button
        onClick={onReset}
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground hover:bg-background/50 h-8 w-8 p-0 transition-colors duration-200 rounded-full"
        title="Reset Timer"
      >
        <RefreshCw size={16} />
      </Button>
    </div>
  );
};

export default TimerControls;
