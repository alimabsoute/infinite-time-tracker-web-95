
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Timer } from "../../types";
import { Target, Clock, Brain, Zap, TrendingUp } from 'lucide-react';
import { format, startOfWeek, addDays, differenceInMinutes } from 'date-fns';

interface FocusAnalyticsProps {
  timers: Timer[];
  formatTime: (ms: number) => string;
}

const FocusAnalytics: React.FC<FocusAnalyticsProps> = ({ timers, formatTime }) => {
  // Define focus session thresholds
  const DEEP_FOCUS_THRESHOLD = 45 * 60 * 1000; // 45 minutes
  const MEDIUM_FOCUS_THRESHOLD = 25 * 60 * 1000; // 25 minutes
  const SHORT_FOCUS_THRESHOLD = 10 * 60 * 1000; // 10 minutes

  // Calculate focus metrics
  const calculateFocusMetrics = () => {
    const focusTimers = timers.filter(timer => timer.elapsedTime > SHORT_FOCUS_THRESHOLD);
    
    const deepFocus = focusTimers.filter(timer => timer.elapsedTime >= DEEP_FOCUS_THRESHOLD);
    const mediumFocus = focusTimers.filter(timer => 
      timer.elapsedTime >= MEDIUM_FOCUS_THRESHOLD && timer.elapsedTime < DEEP_FOCUS_THRESHOLD
    );
    const shortFocus = focusTimers.filter(timer => 
      timer.elapsedTime >= SHORT_FOCUS_THRESHOLD && timer.elapsedTime < MEDIUM_FOCUS_THRESHOLD
    );

    const totalFocusTime = focusTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
    const averageFocusSession = focusTimers.length > 0 ? totalFocusTime / focusTimers.length : 0;
    
    return {
      deepFocus: deepFocus.length,
      mediumFocus: mediumFocus.length,
      shortFocus: shortFocus.length,
      totalSessions: focusTimers.length,
      totalFocusTime,
      averageFocusSession,
      deepFocusTime: deepFocus.reduce((sum, timer) => sum + timer.elapsedTime, 0),
      mediumFocusTime: mediumFocus.reduce((sum, timer) => sum + timer.elapsedTime, 0),
      shortFocusTime: shortFocus.reduce((sum, timer) => sum + timer.elapsedTime, 0)
    };
  };

  // Generate hourly focus pattern
  const generateHourlyFocus = () => {
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      sessions: 0,
      totalTime: 0,
      deepFocus: 0
    }));

    timers.forEach(timer => {
      if (timer.elapsedTime > SHORT_FOCUS_THRESHOLD) {
        const hour = new Date(timer.createdAt).getHours();
        hourlyData[hour].sessions++;
        hourlyData[hour].totalTime += timer.elapsedTime / 3600000; // Convert to hours
        if (timer.elapsedTime >= DEEP_FOCUS_THRESHOLD) {
          hourlyData[hour].deepFocus++;
        }
      }
    });

    return hourlyData;
  };

  // Generate weekly focus breakdown
  const generateWeeklyFocus = () => {
    const weekStart = startOfWeek(new Date());
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const dayTimers = timers.filter(timer => {
        const timerDate = new Date(timer.createdAt);
        return timerDate.toDateString() === date.toDateString() && 
               timer.elapsedTime > SHORT_FOCUS_THRESHOLD;
      });

      const deepFocusSessions = dayTimers.filter(timer => timer.elapsedTime >= DEEP_FOCUS_THRESHOLD);
      
      return {
        day: format(date, 'EEE'),
        sessions: dayTimers.length,
        deepFocus: deepFocusSessions.length,
        totalTime: dayTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0) / 3600000
      };
    });

    return weekData;
  };

  const focusMetrics = calculateFocusMetrics();
  const hourlyData = generateHourlyFocus();
  const weeklyData = generateWeeklyFocus();

  // Focus distribution for pie chart
  const focusDistribution = [
    { name: 'Deep Focus (45+ min)', value: focusMetrics.deepFocus, color: 'hsl(var(--primary))' },
    { name: 'Medium Focus (25-44 min)', value: focusMetrics.mediumFocus, color: 'hsl(var(--accent))' },
    { name: 'Short Focus (10-24 min)', value: focusMetrics.shortFocus, color: 'hsl(var(--muted))' }
  ];

  // Find peak focus hours
  const peakHours = hourlyData
    .sort((a, b) => b.totalTime - a.totalTime)
    .slice(0, 3)
    .filter(hour => hour.totalTime > 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground border border-border p-3 rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          <div className="space-y-1 mt-2">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {entry.name.includes('Time') ? 
                  `${entry.value.toFixed(1)}h` : entry.value}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Focus Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deep Focus</p>
                <p className="text-xl font-bold">{focusMetrics.deepFocus}</p>
                <p className="text-xs text-muted-foreground">45+ min sessions</p>
              </div>
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Focus Score</p>
                <p className="text-xl font-bold">
                  {focusMetrics.totalSessions > 0 ? 
                    Math.round((focusMetrics.deepFocus / focusMetrics.totalSessions) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Deep focus ratio</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Session</p>
                <p className="text-xl font-bold">{formatTime(focusMetrics.averageFocusSession)}</p>
                <p className="text-xs text-muted-foreground">Focus sessions only</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Focus</p>
                <p className="text-xl font-bold">{formatTime(focusMetrics.totalFocusTime)}</p>
                <p className="text-xs text-muted-foreground">This period</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Focus Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Focus Session Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={focusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {focusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Focus Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sessions" name="Total Sessions" fill="hsl(var(--primary))" />
                  <Bar dataKey="deepFocus" name="Deep Focus" fill="hsl(var(--accent))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Focus Pattern */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hourly Focus Pattern
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 10 }}
                  interval={1}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalTime" name="Focus Time (h)" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Peak Focus Hours */}
      {peakHours.length > 0 && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Peak Focus Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {peakHours.map((hour, index) => (
                <div key={hour.hour} className="text-center p-4 bg-muted/50 rounded-lg">
                  <Badge variant="secondary" className="mb-2">
                    #{index + 1}
                  </Badge>
                  <p className="font-medium">{hour.hour}</p>
                  <p className="text-sm text-muted-foreground">
                    {hour.totalTime.toFixed(1)}h focus
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hour.sessions} sessions
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FocusAnalytics;
