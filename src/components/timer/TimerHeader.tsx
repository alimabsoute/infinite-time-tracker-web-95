
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
    <div className="flex justify-between items-start mb-0">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-foreground flex items-center">
          {name}
          <Button 
            onClick={onEditClick} 
            variant="ghost" 
            size="icon"
            className="h-4 w-4 ml-0.5 p-0"
          >
            <Pencil size={10} />
          </Button>
        </h3>
        <div className="flex items-center gap-1 mt-0">
          {category && (
            <Badge variant="secondary" className="bg-secondary/20 text-foreground text-[0.65rem] py-0 px-1 h-3.5">
              {category}
            </Badge>
          )}
        </div>
      </div>
      
      <Button 
        onClick={onDeleteClick} 
        variant="ghost" 
        size="icon"
        className="h-5 w-5 text-destructive hover:bg-destructive/10 p-0"
      >
        <Trash2 size={12} />
      </Button>
    </div>
  );
};

export default TimerHeader;
