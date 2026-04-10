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
      <Button
        onClick={onEditClick}
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors rounded-full flex-shrink-0"
      >
        <Pencil size={10} />
      </Button>

      <div className="text-center flex-1 min-w-0 px-2">
        <h3 className="text-sm font-semibold text-foreground leading-tight truncate">{name}</h3>
        {category && (
          <div className="text-xs text-muted-foreground mt-0.5 truncate">{category}</div>
        )}
      </div>

      <Button
        onClick={onDeleteClick}
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full flex-shrink-0"
        title="Delete Timer"
      >
        <Trash2 size={10} />
      </Button>
    </div>
  );
};

export default TimerHeader;
