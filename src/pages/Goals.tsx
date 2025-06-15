
import React, { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { useGoals } from '@/hooks/useGoals';
import { useGoalProgressAutomation } from '@/hooks/useGoalProgressAutomation';
import { useTimers } from '@/hooks/useTimers';
import { Button } from '@/components/ui/button';
import { Plus, Target, Trophy, Clock, Calendar, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateGoalDialog from '@/components/goals/CreateGoalDialog';
import GoalCard from '@/components/goals/GoalCard';
import GoalTemplates from '@/components/goals/GoalTemplates';
import GoalTimerAssociation from '@/components/goals/GoalTimerAssociation';
import { Goal } from '@/types/goals';

const Goals = () => {
  const { goals, loading, createGoal, updateGoal, deleteGoal } = useGoals();
  const { timers } = useTimers();
  const { updateAllGoalProgress } = useGoalProgressAutomation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');
  const totalGoals = goals.length;
  const completionRate = totalGoals > 0 ? (completedGoals.length / totalGoals) * 100 : 0;

  const upcomingDeadlines = activeGoals
    .filter(goal => goal.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 3);

  const automatedGoals = activeGoals.filter(goal => goal.timer_ids && goal.timer_ids.length > 0);

  const handleManualRefresh = async () => {
    await updateAllGoalProgress();
  };

  if (loading) {
    return (
      <PageLayout title="Goals & Targets" description="Set and track your productivity goals">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Goals & Targets"
      description="Set, track, and achieve your productivity goals"
    >
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGoals}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeGoals.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedGoals.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Automated</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{automatedGoals.length}</div>
              <p className="text-xs text-muted-foreground">Auto-tracking</p>
            </CardContent>
          </Card>
        </div>

        {/* Automation Status */}
        {automatedGoals.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Automated Goal Tracking
                  </CardTitle>
                  <CardDescription>
                    Goals automatically updating based on timer sessions
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleManualRefresh}>
                  Refresh Progress
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {automatedGoals.map(goal => (
                  <div key={goal.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{goal.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {goal.timer_ids?.length} timer{goal.timer_ids?.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <Progress 
                      value={(goal.current_value / goal.target_value) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
                      <span>{Math.round((goal.current_value / goal.target_value) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
              <CardDescription>
                Goals with approaching deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingDeadlines.map(goal => (
                  <div key={goal.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{goal.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Due: {new Date(goal.deadline!).toLocaleDateString()}
                      </div>
                    </div>
                    <Progress 
                      value={(goal.current_value / goal.target_value) * 100} 
                      className="w-24"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Goals</h2>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">Active ({activeGoals.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedGoals.length})</TabsTrigger>
            <TabsTrigger value="automation">Timer Links</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeGoals.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No active goals</h3>
                    <p className="mt-1 text-muted-foreground">
                      Create your first goal to start tracking your progress
                    </p>
                    <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeGoals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={updateGoal}
                    onDelete={deleteGoal}
                    onClick={() => setSelectedGoal(goal)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedGoals.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No completed goals yet</h3>
                    <p className="mt-1 text-muted-foreground">
                      Complete your first goal to see it here
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedGoals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={updateGoal}
                    onDelete={deleteGoal}
                    onClick={() => setSelectedGoal(goal)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="automation" className="space-y-4">
            {activeGoals.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Zap className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No active goals</h3>
                    <p className="mt-1 text-muted-foreground">
                      Create goals to link them with timers for automatic progress tracking
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeGoals.map(goal => (
                  <GoalTimerAssociation
                    key={goal.id}
                    goal={goal}
                    timers={timers}
                    onUpdateGoal={updateGoal}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates">
            <GoalTemplates onCreateFromTemplate={createGoal} />
          </TabsContent>
        </Tabs>

        {/* Create Goal Dialog */}
        <CreateGoalDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreateGoal={createGoal}
        />
      </div>
    </PageLayout>
  );
};

export default Goals;
