
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, Target, Calendar, Zap } from 'lucide-react';
import { useProductivityInsights } from '../../hooks/useProductivityInsights';
import { Timer } from "../../types";
import { format } from 'date-fns';

interface ProductivityInsightsProps {
  timers: Timer[];
  formatTime: (ms: number) => string;
}

const ProductivityInsights: React.FC<ProductivityInsightsProps> = ({ timers, formatTime }) => {
  const insights = useProductivityInsights(timers);

  const insights_cards = [
    {
      title: "Weekly Growth",
      value: `${insights.weeklyGrowth >= 0 ? '+' : ''}${insights.weeklyGrowth.toFixed(1)}%`,
      icon: insights.weeklyGrowth >= 0 ? TrendingUp : TrendingDown,
      color: insights.weeklyGrowth >= 0 ? 'text-green-500' : 'text-red-500',
      description: `vs last week (${formatTime(insights.totalTimeLastWeek)})`
    },
    {
      title: "Productivity Score",
      value: `${insights.productivityScore}/100`,
      icon: Zap,
      color: insights.productivityScore >= 70 ? 'text-green-500' : 
             insights.productivityScore >= 40 ? 'text-yellow-500' : 'text-red-500',
      description: "Based on consistency & volume"
    },
    {
      title: "Avg Session",
      value: formatTime(insights.averageSessionTime),
      icon: Clock,
      color: 'text-blue-500',
      description: `Across ${timers.length} sessions`
    },
    {
      title: "Completion Rate",
      value: `${insights.completionRate.toFixed(1)}%`,
      icon: Target,
      color: insights.completionRate >= 70 ? 'text-green-500' : 
             insights.completionRate >= 40 ? 'text-yellow-500' : 'text-red-500',
      description: "Tasks with meaningful time"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {insights_cards.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className="glass-effect">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                    <p className="text-xl font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                  </div>
                  <IconComponent className={`h-8 w-8 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Insights & Recommendations */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Productivity Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Peak Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Most productive hour:</span>
                  <Badge variant="secondary">{insights.mostProductiveHour}:00</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Most productive day:</span>
                  <Badge variant="secondary">{insights.mostProductiveDay}</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Weekly Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>This week:</span>
                  <span className="font-mono">{formatTime(insights.totalTimeThisWeek)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Daily average:</span>
                  <span className="font-mono">{formatTime(insights.totalTimeThisWeek / 7)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          {insights.upcomingDeadlines.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Deadlines
              </h4>
              <div className="space-y-2">
                {insights.upcomingDeadlines.slice(0, 3).map(timer => (
                  <div key={timer.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm font-medium">{timer.name}</span>
                    <Badge variant="outline">
                      {format(new Date(timer.deadline!), 'MMM d')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Productivity Score Breakdown */}
          <div>
            <h4 className="font-medium mb-2">Productivity Score Breakdown</h4>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Consistency</span>
                  <span>{Math.round((insights.dailyTrend.filter(d => d.time > 0).length / 7) * 100)}%</span>
                </div>
                <Progress value={(insights.dailyTrend.filter(d => d.time > 0).length / 7) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Volume</span>
                  <span>{Math.min(100, Math.round((insights.totalTimeThisWeek / (8 * 3600000)) * 100))}%</span>
                </div>
                <Progress value={Math.min(100, (insights.totalTimeThisWeek / (8 * 3600000)) * 100)} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductivityInsights;
