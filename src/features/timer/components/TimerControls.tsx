
import { RefreshCw, Play, Pause } from 'lucide-react';
import { Button } from '@shared/components/ui/button';

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
        className="rounded-full h-12 w-12 border-2 hover:scale-110 shadow-lg transition-all duration-200"
        style={{
          borderColor: timerColor || 'hsl(var(--primary))',
          backgroundColor: isRunning ? `${timerColor}20` : 'rgba(255, 255, 255, 0.9)',
          color: timerColor || 'hsl(var(--primary))',
        }}
      >
        {isRunning ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
      </Button>
      
      <Button
        onClick={onReset}
        variant="ghost"
        size="icon"
        className="text-gray-600 hover:text-gray-800 hover:bg-white/80 h-8 w-8 p-0 transition-all duration-200 rounded-full"
        title="Reset Timer"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
        }}
      >
        <RefreshCw size={16} />
      </Button>
    </div>
  );
};

export default TimerControls;
