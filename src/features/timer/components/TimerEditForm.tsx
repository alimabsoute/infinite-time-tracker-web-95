import { X, Check, DollarSign } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select';
import { FormEvent, RefObject } from 'react';

interface TimerEditFormProps {
  nameInputRef: RefObject<HTMLInputElement>;
  editedName: string;
  editedCategory: string;
  editedBillable: boolean;
  editedHourlyRate: string;
  onNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onBillableChange: (value: boolean) => void;
  onHourlyRateChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

const TimerEditForm = ({
  nameInputRef,
  editedName,
  editedCategory,
  editedBillable,
  editedHourlyRate,
  onNameChange,
  onCategoryChange,
  onBillableChange,
  onHourlyRateChange,
  onSubmit,
  onCancel,
}: TimerEditFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-2.5">
      <Input
        ref={nameInputRef}
        value={editedName}
        onChange={(e) => onNameChange(e.target.value)}
        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm h-9"
        placeholder="Timer name"
      />

      <Select value={editedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="bg-white/10 border-white/20 text-white text-xs h-8">
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

      {/* Billable row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onBillableChange(!editedBillable)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            editedBillable
              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
              : 'bg-white/10 text-white/60 border border-white/20'
          }`}
        >
          <DollarSign size={11} />
          {editedBillable ? 'Billable' : 'Not billable'}
        </button>

        {editedBillable && (
          <div className="flex items-center gap-1 flex-1">
            <span className="text-white/50 text-xs">$/hr</span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={editedHourlyRate}
              onChange={(e) => onHourlyRateChange(e.target.value)}
              className="bg-white/10 border-white/20 text-white text-xs h-7 px-2"
              placeholder="0.00"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}
          className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
          <X size={14} />
        </Button>
        <Button type="submit" variant="ghost" size="icon"
          className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-white/10">
          <Check size={14} />
        </Button>
      </div>
    </form>
  );
};

export default TimerEditForm;
