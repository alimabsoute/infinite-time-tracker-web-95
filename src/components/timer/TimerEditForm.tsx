
import { X, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FormEvent, RefObject } from 'react';

interface TimerEditFormProps {
  nameInputRef: RefObject<HTMLInputElement>;
  editedName: string;
  editedCategory: string;
  onNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

const TimerEditForm = ({
  nameInputRef,
  editedName,
  editedCategory,
  onNameChange,
  onCategoryChange,
  onSubmit,
  onCancel
}: TimerEditFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex">
        <Input
          ref={nameInputRef}
          value={editedName}
          onChange={(e) => onNameChange(e.target.value)}
          className="bg-background/60 border-border/20 text-sm h-8"
          placeholder="Timer name"
        />
      </div>
      
      <div className="flex gap-1">
        <Select value={editedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="bg-background/60 border-border/20 flex-1 text-xs h-7">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="uncategorized">Uncategorized</SelectItem>
            <SelectItem value="Work">Work</SelectItem>
            <SelectItem value="Study">Study</SelectItem>
            <SelectItem value="Personal">Personal</SelectItem>
            <SelectItem value="Health">Health</SelectItem>
            <SelectItem value="Leisure">Leisure</SelectItem>
            <SelectItem value="Project">Project</SelectItem>
            <SelectItem value="Meeting">Meeting</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex gap-1">
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={onCancel}
            className="bg-background/60 border-border/20 h-7 w-7"
          >
            <X size={14} />
          </Button>
          <Button 
            type="submit" 
            variant="outline" 
            size="icon"
            className="bg-background/60 border-border/20 h-7 w-7"
          >
            <Check size={14} />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TimerEditForm;
