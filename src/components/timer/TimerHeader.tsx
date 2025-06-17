
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

interface TimerHeaderProps {
  name: string;
  category?: string;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const TimerHeader = ({ name, category, onEditClick, onDeleteClick }: TimerHeaderProps) => {
  return (
    <div className="flex justify-between items-center px-2">
      {/* Timer name - centered */}
      <div className="flex-1 text-center">
        <h3 className="text-base font-semibold text-white leading-tight truncate px-8">
          {name}
        </h3>
      </div>
      
      {/* Floating action buttons */}
      <div className="absolute -right-2 -top-2 flex gap-1">
        <Button 
          onClick={onEditClick} 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-white/20 transition-colors rounded-full backdrop-blur-sm border border-white/20"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
          <Pencil size={14} />
        </Button>
        
        <Button 
          onClick={onDeleteClick} 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-red-400 hover:bg-red-500/30 hover:text-red-300 p-0 transition-colors rounded-full backdrop-blur-sm border border-red-400/30"
          title="Delete Timer"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
};

export default TimerHeader;
