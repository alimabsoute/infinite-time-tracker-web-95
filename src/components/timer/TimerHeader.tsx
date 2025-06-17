
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
    <div className="flex justify-center items-center relative">
      {/* Timer name - centered above circle */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 leading-tight truncate max-w-60">
          {name}
        </h3>
        {category && (
          <div className="text-sm text-gray-600 mt-1 truncate max-w-60">
            {category}
          </div>
        )}
      </div>
      
      {/* Floating action buttons positioned to the right */}
      <div className="absolute -right-4 top-0 flex gap-2">
        <Button 
          onClick={onEditClick} 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-white/80 transition-colors rounded-full backdrop-blur-sm border border-gray-300/50"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
        >
          <Pencil size={14} />
        </Button>
        
        <Button 
          onClick={onDeleteClick} 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 p-0 transition-colors rounded-full backdrop-blur-sm border border-red-200/50"
          title="Delete Timer"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
};

export default TimerHeader;
