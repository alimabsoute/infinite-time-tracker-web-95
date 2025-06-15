
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Play, Pause, CheckCircle } from 'lucide-react';
import { Goal } from '@/types/goals';
import { formatDistanceToNow, format } from 'date-fns';

interface GoalCardProps {
  goal: Goal;
  onUpdate: (id: string, updates: Partial<Goal>) => Promise<Goal | null>;
  onDelete: (id: string) => Promise<void>;
  onClick: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onUpdate, onDelete, onClick }) => {
  const progressPercentage = Math.min((goal.current_value / goal.target_value) * 100, 100);
  const isCompleted = goal.status === 'completed';
  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && !isCompleted;

  const getTypeIcon = (type: Goal['type']) => {
    switch (type) {
      case 'time_based':
        return '⏱️';
      case 'session_count':
        return '📊';
      case 'streak':
        return '🔥';
      case 'deadline':
        return '📅';
      default:
        return '🎯';
    }
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'paused':
        return 'outline';
      case 'archived':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'hours') {
      return `${(value / 60).toFixed(1)}h`;
    } else if (unit === 'minutes') {
      return `${value}m`;
    }
    return `${value} ${unit}`;
  };

  const handleStatusToggle = async () => {
    if (goal.status === 'active') {
      if (progressPercentage >= 100) {
        await onUpdate(goal.id, { 
          status: 'completed',
          completed_at: new Date().toISOString(),
          current_value: goal.target_value
        });
      } else {
        await onUpdate(goal.id, { status: 'paused' });
      }
    } else if (goal.status === 'paused') {
      await onUpdate(goal.id, { status: 'active' });
    }
  };

  return (
    <Card className={`cursor-pointer transition-all hover:shadow-md ${isOverdue ? 'border-destructive' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={onClick}>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>{getTypeIcon(goal.type)}</span>
              {goal.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {goal.description}
            </CardDescription>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleStatusToggle}>
                {goal.status === 'active' ? (
                  progressPercentage >= 100 ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Goal
                    </>
                  )
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume Goal
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Goal
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete(goal.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Badge variant={getStatusColor(goal.status)}>
            {goal.status}
          </Badge>
          {goal.category && (
            <Badge variant="outline">{goal.category}</Badge>
          )}
          {goal.priority && (
            <Badge variant="outline">P{goal.priority}</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent onClick={onClick}>
        <div className="space-y-3">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span className="font-medium">
                {formatValue(goal.current_value, goal.unit)} / {formatValue(goal.target_value, goal.unit)}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {progressPercentage.toFixed(1)}% complete
            </div>
          </div>

          {/* Timeline */}
          <div className="text-sm text-muted-foreground">
            <div>Started {formatDistanceToNow(new Date(goal.start_date))} ago</div>
            {goal.deadline && (
              <div className={isOverdue ? 'text-destructive font-medium' : ''}>
                Due {goal.deadline ? formatDistanceToNow(new Date(goal.deadline)) : ''} 
                {isOverdue ? ' (Overdue)' : ''}
              </div>
            )}
            {goal.completed_at && (
              <div className="text-green-600">
                Completed {formatDistanceToNow(new Date(goal.completed_at))} ago
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalCard;
