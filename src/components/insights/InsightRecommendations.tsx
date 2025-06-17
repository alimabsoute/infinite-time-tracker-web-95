
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, Clock, Target, Calendar } from 'lucide-react';
import { Timer, TimerSessionWithTimer } from '../../types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface InsightRecommendationsProps {
  insights: any;
  timers: Timer[];
  sessions: TimerSessionWithTimer[];
}

const InsightRecommendations: React.FC<InsightRecommendationsProps> = ({
  insights,
  timers,
  sessions
}) => {
  const generateRecommendations = () => {
    const recommendations = [];

    // Consistency recommendation
    const activeDays = insights.dailyTrend.filter((d: any) => d.time > 0).length;
    if (activeDays < 5) {
      recommendations.push({
        title: "Improve consistency",
        description: "Try to work at least 5 days per week to build momentum",
        action: "Set daily reminders",
        priority: "high",
        icon: Calendar
      });
    }

    // Session length recommendation
    if (insights.averageSessionTime < 20 * 60 * 1000) {
      recommendations.push({
        title: "Extend session length",
        description: "Aim for 25-30 minute focused sessions for better productivity",
        action: "Try the Pomodoro technique",
        priority: "medium",
        icon: Clock
      });
    }

    // Peak time recommendation
    if (insights.mostProductiveHour > 0) {
      recommendations.push({
        title: "Leverage peak hours",
        description: `Schedule your most important work around ${insights.mostProductiveHour}:00`,
        action: "Block calendar time",
        priority: "medium",
        icon: TrendingUp
      });
    }

    // Deadline recommendation
    if (insights.upcomingDeadlines.length > 0) {
      recommendations.push({
        title: "Focus on deadlines",
        description: `You have ${insights.upcomingDeadlines.length} upcoming deadlines`,
        action: "Prioritize urgent tasks",
        priority: "high",
        icon: Target
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  if (recommendations.length === 0) {
    return (
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            You're doing great!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your productivity patterns look healthy. Keep up the good work!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Smart Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const IconComponent = rec.icon;
            return (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <IconComponent className="h-4 w-4 text-primary" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{rec.title}</h4>
                    <Badge 
                      variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {rec.description}
                  </p>
                  
                  <Button size="sm" variant="outline" className="text-xs">
                    {rec.action}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border/30">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Want more detailed analytics?
            </p>
            <Link to="/reports">
              <Button size="sm" variant="outline">
                View Reports
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightRecommendations;
