
import { RefreshCw, Play, Pause } from 'lucide-react';
import { Button } from '../ui/button';

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
        className="rounded-full h-12 w-12 border-2 hover:scale-110 shadow-lg transition-all duration-200 backdrop-blur-sm"
        style={{
          borderColor: timerColor || 'hsl(var(--primary))',
          backgroundColor: isRunning ? `${timerColor}40` : 'rgba(255, 255, 255, 0.1)',
          color: timerColor || 'hsl(var(--primary))',
          backdropFilter: 'blur(8px)',
        }}
      >
        {isRunning ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
      </Button>
      
      <Button
        onClick={onReset}
        variant="ghost"
        size="icon"
        className="text-gray-300 hover:text-white hover:bg-white/20 h-8 w-8 p-0 transition-all duration-200 rounded-full backdrop-blur-sm"
        title="Reset Timer"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <RefreshCw size={16} />
      </Button>
    </div>
  );
};

export default TimerControls;
