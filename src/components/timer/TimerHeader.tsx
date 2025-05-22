
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
    <div className="flex justify-between items-start mb-1">
      <div className="flex-1">
        <h3 className="text-base font-medium text-foreground flex items-center">
          {name}
          <Button 
            onClick={onEditClick} 
            variant="ghost" 
            size="icon"
            className="h-5 w-5 ml-1 p-0"
          >
            <Pencil size={12} />
          </Button>
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          {category && (
            <Badge variant="secondary" className="bg-secondary/20 text-foreground text-xs py-0 px-1.5 h-4">
              {category}
            </Badge>
          )}
        </div>
      </div>
      
      <Button 
        onClick={onDeleteClick} 
        variant="ghost" 
        size="icon"
        className="h-6 w-6 text-destructive hover:bg-destructive/10 p-0"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
};

export default TimerHeader;
