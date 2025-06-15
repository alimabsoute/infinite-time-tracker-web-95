
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateGoalInput, Goal } from '@/types/goals';
import { useTimers } from '@/hooks/useTimers';
import { Checkbox } from '@/components/ui/checkbox';

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGoal: (goal: CreateGoalInput) => Promise<Goal | null>;
}

const CreateGoalDialog: React.FC<CreateGoalDialogProps> = ({
  open,
  onOpenChange,
  onCreateGoal,
}) => {
  const { timers } = useTimers();
  const [formData, setFormData] = useState<CreateGoalInput>({
    title: '',
    description: '',
    type: 'time_based',
    target_value: 0,
    unit: 'hours',
    category: '',
    timer_ids: [],
    priority: 3,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || formData.target_value <= 0) return;

    setLoading(true);
    try {
      const result = await onCreateGoal(formData);
      if (result) {
        onOpenChange(false);
        setFormData({
          title: '',
          description: '',
          type: 'time_based',
          target_value: 0,
          unit: 'hours',
          category: '',
          timer_ids: [],
          priority: 3,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTimerToggle = (timerId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      timer_ids: checked
        ? [...(prev.timer_ids || []), timerId]
        : (prev.timer_ids || []).filter(id => id !== timerId)
    }));
  };

  const getUnitOptions = (type: Goal['type']) => {
    switch (type) {
      case 'time_based':
        return ['minutes', 'hours'];
      case 'session_count':
        return ['sessions'];
      case 'streak':
        return ['days'];
      case 'deadline':
        return ['hours', 'tasks'];
      default:
        return ['hours'];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
          <DialogDescription>
            Set up a new productivity goal to track your progress
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="title">Goal Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Complete 40 hours of focused work"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your goal and why it's important to you"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Goal Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Goal['type']) => {
                    setFormData(prev => ({
                      ...prev,
                      type: value,
                      unit: getUnitOptions(value)[0]
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time_based">⏱️ Time-based</SelectItem>
                    <SelectItem value="session_count">📊 Session Count</SelectItem>
                    <SelectItem value="streak">🔥 Streak</SelectItem>
                    <SelectItem value="deadline">📅 Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Work, Study, Health"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target_value">Target Value *</Label>
                <Input
                  id="target_value"
                  type="number"
                  min="1"
                  value={formData.target_value || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_value: Number(e.target.value) }))}
                  placeholder="e.g., 40"
                  required
                />
              </div>

              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {getUnitOptions(formData.type).map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="deadline">Deadline (optional)</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={formData.deadline || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority?.toString() || '3'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">🔴 High (1)</SelectItem>
                  <SelectItem value="2">🟡 Medium-High (2)</SelectItem>
                  <SelectItem value="3">🟢 Medium (3)</SelectItem>
                  <SelectItem value="4">🔵 Low-Medium (4)</SelectItem>
                  <SelectItem value="5">⚫ Low (5)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {timers.length > 0 && (
              <div>
                <Label>Associated Timers (optional)</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                  {timers.map(timer => (
                    <div key={timer.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`timer-${timer.id}`}
                        checked={(formData.timer_ids || []).includes(timer.id)}
                        onCheckedChange={(checked) => handleTimerToggle(timer.id, checked as boolean)}
                      />
                      <label
                        htmlFor={`timer-${timer.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {timer.name}
                        {timer.category && (
                          <span className="text-muted-foreground ml-2">({timer.category})</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGoalDialog;
