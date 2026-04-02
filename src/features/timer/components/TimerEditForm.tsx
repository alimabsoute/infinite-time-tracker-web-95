
import { X, Check } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
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
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex">
        <Input
          ref={nameInputRef}
          value={editedName}
          onChange={(e) => onNameChange(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 text-sm h-9 backdrop-blur-sm"
          placeholder="Timer name"
        />
      </div>
      
      <div className="flex gap-2">
        <Select value={editedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-sm flex-1 text-xs h-8">
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
        
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={onCancel}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-8 w-8 backdrop-blur-sm"
          >
            <X size={14} />
          </Button>
          <Button 
            type="submit" 
            variant="outline" 
            size="icon"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-8 w-8 backdrop-blur-sm"
          >
            <Check size={14} />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TimerEditForm;
