
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import { Button } from '@shared/components/ui/button';
import { Lightbulb, TrendingUp, Clock, Target, Calendar } from 'lucide-react';
import { Timer, TimerSessionWithTimer } from '../../types';
import { Link } from 'react-router-dom';
import { addHours } from 'date-fns';
import CountdownTimer from './CountdownTimer';

interface InsightRecommendationsProps {
  insights: any;
  timers: Timer[];
  sessions: TimerSessionWithTimer[];
}

const InsightRecommendations: React.FC<InsightRecommendationsProps> = ({
  insights,
}) => {
  const generateRecommendations = () => {
    const recommendations = [];

    // Consistency recommendation with countdown
    const activeDays = insights.dailyTrend.filter((d: any) => d.time > 0).length;
    if (activeDays < 5) {
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
      weekEnd.setHours(23, 59, 59, 999);
      
      recommendations.push({
        title: "Improve consistency",
        description: "Try to work at least 5 days per week to build momentum",
        action: "Set daily reminders",
        priority: "high",
        icon: Calendar,
        countdown: {
          targetDate: weekEnd,
          label: "Week ends in"
        }
      });
    }

    // Session length recommendation
    if (insights.averageSessionTime < 20 * 60 * 1000) {
      const nextSession = addHours(new Date(), 2); // Suggest next session in 2 hours
      
      recommendations.push({
        title: "Extend session length",
        description: "Aim for 25-30 minute focused sessions for better productivity",
        action: "Try the Pomodoro technique",
        priority: "medium",
        icon: Clock,
        countdown: {
          targetDate: nextSession,
          label: "Next session in"
        }
      });
    }

    // Peak time recommendation with countdown to next peak time
    if (insights.mostProductiveHour > 0) {
      const nextPeakTime = new Date();
      const currentHour = nextPeakTime.getHours();
      
      if (currentHour >= insights.mostProductiveHour) {
        nextPeakTime.setDate(nextPeakTime.getDate() + 1);
      }
      nextPeakTime.setHours(insights.mostProductiveHour, 0, 0, 0);
      
      recommendations.push({
        title: "Leverage peak hours",
        description: `Schedule your most important work around ${insights.mostProductiveHour}:00`,
        action: "Block calendar time",
        priority: "medium",
        icon: TrendingUp,
        countdown: {
          targetDate: nextPeakTime,
          label: "Next peak time"
        }
      });
    }

    // Deadline recommendation with urgent countdown
    if (insights.upcomingDeadlines.length > 0) {
      const nextDeadline = new Date(insights.upcomingDeadlines[0].deadline);
      
      recommendations.push({
        title: "Focus on deadlines",
        description: `You have ${insights.upcomingDeadlines.length} upcoming deadlines`,
        action: "Prioritize urgent tasks",
        priority: "high",
        icon: Target,
        countdown: {
          targetDate: nextDeadline,
          label: "Due in"
        }
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
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 ml-auto">
            Live updates
          </Badge>
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
                  
                  {rec.countdown && (
                    <div className="py-2">
                      <CountdownTimer
                        targetDate={rec.countdown.targetDate}
                        label={rec.countdown.label}
                        variant={rec.priority === 'high' ? 'urgent' : 'default'}
                      />
                    </div>
                  )}
                  
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
