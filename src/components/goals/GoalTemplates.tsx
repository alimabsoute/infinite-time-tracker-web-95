
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GoalTemplate, CreateGoalInput, Goal } from '@/types/goals';

interface GoalTemplatesProps {
  onCreateFromTemplate: (goal: CreateGoalInput) => Promise<Goal | null>;
}

const goalTemplates: GoalTemplate[] = [
  {
    name: "Daily Deep Work",
    type: "time_based",
    target_value: 4,
    unit: "hours",
    description: "Focus on deep, uninterrupted work for 4 hours daily",
    category: "Productivity",
    milestones: [
      { title: "First Week", target_percentage: 25, description: "Complete first week of consistent deep work" },
      { title: "Two Weeks", target_percentage: 50, description: "Maintain the habit for two weeks" },
      { title: "One Month", target_percentage: 100, description: "Successfully complete a full month" }
    ]
  },
  {
    name: "Weekly Study Sessions",
    type: "session_count",
    target_value: 20,
    unit: "sessions",
    description: "Complete 20 focused study sessions this month",
    category: "Learning",
    milestones: [
      { title: "Quarter Way", target_percentage: 25, description: "Complete 5 study sessions" },
      { title: "Halfway Point", target_percentage: 50, description: "Reach 10 study sessions" },
      { title: "Final Stretch", target_percentage: 75, description: "Complete 15 sessions" }
    ]
  },
  {
    name: "30-Day Consistency Streak",
    type: "streak",
    target_value: 30,
    unit: "days",
    description: "Maintain a 30-day streak of daily progress",
    category: "Habits",
    milestones: [
      { title: "First Week", target_percentage: 23, description: "Complete 7 consecutive days" },
      { title: "Two Weeks", target_percentage: 47, description: "Reach 14-day streak" },
      { title: "Three Weeks", target_percentage: 70, description: "Achieve 21-day milestone" }
    ]
  },
  {
    name: "Project Deadline Goal",
    type: "deadline",
    target_value: 80,
    unit: "hours",
    description: "Complete 80 hours of project work before deadline",
    category: "Project",
    milestones: [
      { title: "Foundation", target_percentage: 25, description: "Complete initial 20 hours" },
      { title: "Development", target_percentage: 50, description: "Reach 40 hours milestone" },
      { title: "Refinement", target_percentage: 75, description: "Complete 60 hours" }
    ]
  },
  {
    name: "Weekly Exercise Routine",
    type: "session_count",
    target_value: 12,
    unit: "sessions",
    description: "Complete 12 workout sessions this month",
    category: "Health",
    milestones: [
      { title: "Getting Started", target_percentage: 25, description: "Complete first 3 workouts" },
      { title: "Building Momentum", target_percentage: 50, description: "Reach 6 workout sessions" },
      { title: "Strong Finish", target_percentage: 75, description: "Complete 9 sessions" }
    ]
  },
  {
    name: "Reading Challenge",
    type: "time_based",
    target_value: 30,
    unit: "hours",
    description: "Dedicate 30 hours to reading this month",
    category: "Learning",
    milestones: [
      { title: "First Book", target_percentage: 33, description: "Complete 10 hours of reading" },
      { title: "Halfway Mark", target_percentage: 50, description: "Reach 15 hours" },
      { title: "Final Sprint", target_percentage: 80, description: "Complete 24 hours" }
    ]
  }
];

const GoalTemplates: React.FC<GoalTemplatesProps> = ({ onCreateFromTemplate }) => {
  const handleUseTemplate = async (template: GoalTemplate) => {
    const goalData: CreateGoalInput = {
      title: template.name,
      description: template.description,
      type: template.type,
      target_value: template.target_value,
      unit: template.unit,
      category: template.category,
    };

    await onCreateFromTemplate(goalData);
  };

  const getTypeIcon = (type: string) => {
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

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Goal Templates</h3>
        <p className="text-muted-foreground">
          Choose from pre-built goal templates to get started quickly
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goalTemplates.map((template, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span>{getTypeIcon(template.type)}</span>
                {template.name}
              </CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{template.category}</Badge>
                <Badge variant="secondary">
                  {template.target_value} {template.unit}
                </Badge>
              </div>

              {template.milestones && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Milestones:</h4>
                  <div className="space-y-1">
                    {template.milestones.map((milestone, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground">
                        • {milestone.title} ({milestone.target_percentage}%)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleUseTemplate(template)}
              >
                Use This Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GoalTemplates;
