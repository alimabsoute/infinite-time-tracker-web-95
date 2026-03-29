import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Clock, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, differenceInDays, startOfWeek, addDays } from 'date-fns';
import { TimerSessionWithTimer } from "../../types";

interface WeeklyAnalysisProps {
  sessions: TimerSessionWithTimer[];
  currentWeekStart: Date;
}

interface AnalysisData {
  totalTime: number;
  sessionCount: number;
  averageSessionLength: number;
  mostActiveDay: string;
  productiveHours: string;
  topCategory: string;
  completionRate: number;
  trends: {
    timeChange: number;
    sessionChange: number;
  };
  recommendations: string[];
}

export const WeeklyAnalysis: React.FC<WeeklyAnalysisProps> = ({
  sessions,
  currentWeekStart
}) => {
  const analysis = useMemo((): AnalysisData => {
    
    // Filter sessions for current week
    const weekEnd = addDays(currentWeekStart, 7);
    const weekSessions = sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return sessionDate >= currentWeekStart && sessionDate < weekEnd;
    });
    
    
    // Basic metrics
    const totalTime = weekSessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0);
    const sessionCount = weekSessions.length;
    const averageSessionLength = sessionCount > 0 ? totalTime / sessionCount : 0;
    
    // Day analysis
    const dayData = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(currentWeekStart, i);
      const daySessions = weekSessions.filter(session => {
        const sessionDate = new Date(session.start_time);
        return sessionDate.toDateString() === date.toDateString();
      });
      
      return {
        day: format(date, 'EEEE'),
        sessions: daySessions.length,
        totalTime: daySessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0)
      };
    });
    
    const mostActiveDay = dayData.reduce((max, day) => 
      day.totalTime > max.totalTime ? day : max, dayData[0]
    ).day;
    
    // Hour analysis for productive hours
    const hourData = Array.from({ length: 24 }, (_, hour) => {
      const hourSessions = weekSessions.filter(session => {
        const sessionHour = new Date(session.start_time).getHours();
        return sessionHour === hour;
      });
      
      return {
        hour,
        totalTime: hourSessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0)
      };
    });
    
    const mostProductiveHour = hourData.reduce((max, hour) =>
      hour.totalTime > max.totalTime ? hour : max, hourData[0]
    );
    
    const productiveHours = `${mostProductiveHour.hour}:00-${mostProductiveHour.hour + 1}:00`;
    
    // Category analysis
    const categoryData = weekSessions.reduce((acc, session) => {
      const category = session.timers?.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + (session.duration_ms || 0);
      return acc;
    }, {} as Record<string, number>);
    
    const topCategory = Object.entries(categoryData).reduce((max, [category, time]) =>
      time > max.time ? { category, time } : max, { category: 'None', time: 0 }
    ).category;
    
    // Completion rate (assuming target of 8 hours/week)
    const weeklyTarget = 8 * 60 * 60 * 1000; // 8 hours in ms
    const completionRate = Math.min(100, (totalTime / weeklyTarget) * 100);
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (totalTime < weeklyTarget * 0.5) {
      recommendations.push("Consider setting more consistent daily work sessions");
    }
    
    if (averageSessionLength < 30 * 60 * 1000) { // Less than 30 minutes
      recommendations.push("Try longer focus sessions for better productivity");
    }
    
    if (sessionCount < 5) {
      recommendations.push("Increase session frequency for better habit formation");
    }
    
    const activeDays = dayData.filter(day => day.totalTime > 0).length;
    if (activeDays < 4) {
      recommendations.push("Aim for more consistent daily activity");
    }
    
    if (categoryData.Work && categoryData.Personal && categoryData.Work > categoryData.Personal * 3) {
      recommendations.push("Consider balancing work with personal development time");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Great work! Keep maintaining your productive habits");
    }
    
    return {
      totalTime,
      sessionCount,
      averageSessionLength,
      mostActiveDay,
      productiveHours,
      topCategory,
      completionRate,
      trends: {
        timeChange: 0, // Would need previous week data
        sessionChange: 0 // Would need previous week data
      },
      recommendations
    };
  }, [sessions, currentWeekStart]);
  
  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-effect border border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold text-primary">
                  {formatTime(analysis.totalTime)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary/60" />
            </div>
            <div className="mt-2">
              <Progress value={analysis.completionRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {analysis.completionRate.toFixed(0)}% of weekly target
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessions</p>
                <p className="text-2xl font-bold text-primary">
                  {analysis.sessionCount}
                </p>
              </div>
              <Target className="h-8 w-8 text-primary/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Avg: {formatTime(analysis.averageSessionLength)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Most Active</p>
                <p className="text-lg font-bold text-primary">
                  {analysis.mostActiveDay}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary/60" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Peak: {analysis.productiveHours}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Analysis */}
      <Card className="glass-effect border border-border/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Weekly Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Key Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Top Category</span>
                  <Badge variant="secondary">{analysis.topCategory}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Most Active Day</span>
                  <span className="text-sm font-medium">{analysis.mostActiveDay}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Peak Hours</span>
                  <span className="text-sm font-medium">{analysis.productiveHours}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-2">Recommendations</h4>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WeeklyAnalysis;