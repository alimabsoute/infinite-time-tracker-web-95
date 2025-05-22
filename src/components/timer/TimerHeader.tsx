
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
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          {name}
          <Button 
            onClick={onEditClick} 
            variant="ghost" 
            size="icon"
            className="h-6 w-6 ml-1"
          >
            <Pencil size={14} />
          </Button>
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {category && (
            <Badge variant="secondary" className="bg-secondary/30 text-foreground">
              {category}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex gap-1">
        <Button 
          onClick={onDeleteClick} 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/10"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};

export default TimerHeader;
