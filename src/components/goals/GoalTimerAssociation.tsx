
import React, { useState } from 'react';
import { Goal } from '@/types/goals';
import { Timer } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Timer as TimerIcon, Target, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GoalTimerAssociationProps {
  goal: Goal;
  timers: Timer[];
  onUpdateGoal: (id: string, updates: Partial<Goal>) => Promise<Goal | null>;
}

const GoalTimerAssociation: React.FC<GoalTimerAssociationProps> = ({
  goal,
  timers,
  onUpdateGoal
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const associatedTimerIds = goal.timer_ids || [];
  const availableTimers = timers.filter(timer => !timer.isRunning || associatedTimerIds.includes(timer.id));

  const handleTimerToggle = async (timerId: string, isChecked: boolean) => {
    setIsUpdating(true);
    
    try {
      let newTimerIds: string[];
      
      if (isChecked) {
        newTimerIds = [...associatedTimerIds, timerId];
      } else {
        newTimerIds = associatedTimerIds.filter(id => id !== timerId);
      }

      await onUpdateGoal(goal.id, { timer_ids: newTimerIds });
      
      toast({
        title: "Success",
        description: `Timer ${isChecked ? 'linked to' : 'unlinked from'} goal`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update timer association",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Link Timers to Goal
        </CardTitle>
        <CardDescription>
          Select which timers should automatically contribute to this goal's progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableTimers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TimerIcon className="mx-auto h-12 w-12 opacity-50" />
            <p className="mt-2">No timers available</p>
            <p className="text-sm">Create some timers to link them to this goal</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableTimers.map((timer) => {
              const isAssociated = associatedTimerIds.includes(timer.id);
              
              return (
                <div key={timer.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`timer-${timer.id}`}
                      checked={isAssociated}
                      onCheckedChange={(checked) => 
                        handleTimerToggle(timer.id, checked as boolean)
                      }
                      disabled={isUpdating}
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor={`timer-${timer.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {timer.name}
                      </label>
                      {timer.category && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {timer.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {timer.isRunning && (
                      <Badge variant="secondary" className="text-xs">
                        Running
                      </Badge>
                    )}
                    {isAssociated && (
                      <Target className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {associatedTimerIds.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              {associatedTimerIds.length} timer{associatedTimerIds.length !== 1 ? 's' : ''} linked
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Progress will be automatically calculated from these timers
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalTimerAssociation;
