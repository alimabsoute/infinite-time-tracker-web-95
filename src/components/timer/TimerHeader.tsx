
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface TimerHeaderProps {
  name: string;
  category?: string;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const TimerHeader = ({ name, category, onEditClick, onDeleteClick }: TimerHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white leading-tight">
            {name}
          </h3>
          <Button 
            onClick={onEditClick} 
            variant="ghost" 
            size="icon"
            className="h-7 w-7 p-0 text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded-full"
          >
            <Pencil size={14} />
          </Button>
        </div>
        {category && (
          <div className="mt-2">
            <Badge 
              variant="outline" 
              className="bg-white/10 text-gray-200 text-xs py-1 px-3 border-white/20 backdrop-blur-sm"
            >
              {category}
            </Badge>
          </div>
        )}
      </div>
      
      <Button 
        onClick={onDeleteClick} 
        variant="ghost" 
        size="icon"
        className="h-8 w-8 text-red-400 hover:bg-red-500/20 hover:text-red-300 p-0 transition-colors rounded-full"
        title="Delete Timer"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
};

export default TimerHeader;
