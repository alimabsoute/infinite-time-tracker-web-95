
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
    <div className="flex justify-between items-start mb-2">
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <h3 className="text-base font-semibold text-foreground">
            {name}
          </h3>
          <Button 
            onClick={onEditClick} 
            variant="ghost" 
            size="icon"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil size={12} />
          </Button>
        </div>
        {category && (
          <div className="mt-1">
            <Badge variant="outline" className="bg-secondary/50 text-foreground text-xs py-0.5 px-2 border-border/30">
              {category}
            </Badge>
          </div>
        )}
      </div>
      
      <Button 
        onClick={onDeleteClick} 
        variant="ghost" 
        size="icon"
        className="h-7 w-7 text-destructive hover:bg-destructive/10 p-0 transition-colors"
        title="Delete Timer"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
};

export default TimerHeader;
