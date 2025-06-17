
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
    <div className="flex justify-center items-center gap-4 mt-4">
      <Button
        onClick={onToggle}
        variant="outline"
        size="icon"
        className="rounded-full h-14 w-14 border-3 hover:scale-105 shadow-lg relative transition-all duration-200 backdrop-blur-sm"
        style={{
          borderColor: timerColor || 'hsl(var(--primary))',
          backgroundColor: isRunning ? `${timerColor}25` : 'rgba(0, 0, 0, 0.4)',
          color: timerColor || 'hsl(var(--primary))',
          backdropFilter: 'blur(8px)',
        }}
      >
        {isRunning ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
      </Button>
      
      <Button
        onClick={onReset}
        variant="ghost"
        size="icon"
        className="text-gray-300 hover:text-white hover:bg-white/10 h-10 w-10 p-0 transition-all duration-200 rounded-full backdrop-blur-sm"
        title="Reset Timer"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <RefreshCw size={18} />
      </Button>
    </div>
  );
};

export default TimerControls;
