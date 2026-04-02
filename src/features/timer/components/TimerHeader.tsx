
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@shared/components/ui/button';

interface TimerHeaderProps {
  name: string;
  category?: string;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const TimerHeader = ({ name, category, onEditClick, onDeleteClick }: TimerHeaderProps) => {
  return (
    <div className="flex items-start gap-2 w-full">
      {/* Edit button positioned at top left */}
      <Button 
        onClick={onEditClick} 
        variant="ghost" 
        size="icon"
        className="h-6 w-6 p-0 text-gray-600 hover:text-gray-800 hover:bg-white/80 transition-colors rounded-full backdrop-blur-sm border border-gray-300/50 flex-shrink-0"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
      >
        <Pencil size={10} />
      </Button>
      
      {/* Timer name and category - centered with proper width constraints */}
      <div className="text-center flex-1 min-w-0 px-2">
        <h3 className="text-sm font-semibold text-gray-800 leading-tight truncate">
          {name}
        </h3>
        {category && (
          <div className="text-xs text-gray-600 mt-0.5 truncate">
            {category}
          </div>
        )}
      </div>
      
      {/* Delete button */}
      <Button 
        onClick={onDeleteClick} 
        variant="ghost" 
        size="icon"
        className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-600 p-0 transition-colors rounded-full backdrop-blur-sm border border-red-200/50 flex-shrink-0"
        title="Delete Timer"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
      >
        <Trash2 size={10} />
      </Button>
    </div>
  );
};

export default TimerHeader;
