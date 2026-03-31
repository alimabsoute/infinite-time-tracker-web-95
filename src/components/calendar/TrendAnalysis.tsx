
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { format, subDays, startOfWeek, addDays, subWeeks } from 'date-fns';
import { Timer } from "../../types";
import { TrendingUp, Clock, Calendar } from 'lucide-react';

interface TrendAnalysisProps {
  timers: Timer[];
  formatTime: (ms: number) => string;
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ timers }) => {
  // Generate 30-day trend data
  const generateTrendData = () => {
    const now = new Date();
    const data = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayTimers = timers.filter(timer => {
        const timerDate = new Date(timer.createdAt);
        return timerDate >= dayStart && timerDate <= dayEnd;
      });
      
      const totalTime = dayTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
      const sessionCount = dayTimers.length;
      
      data.push({
        date: format(date, 'MMM d'),
        fullDate: date,
        time: totalTime / 3600000, // Convert to hours
        sessions: sessionCount,
        averageSession: sessionCount > 0 ? (totalTime / sessionCount) / 3600000 : 0
      });
    }
    
    return data;
  };

  // Generate weekly comparison data
  const generateWeeklyData = () => {
    const now = new Date();
    const weeks = [];
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i));
      const weekData = Array.from({ length: 7 }, (_, day) => {
        const date = addDays(weekStart, day);
        const dayTimers = timers.filter(timer => {
          const timerDate = new Date(timer.createdAt);
          return timerDate.toDateString() === date.toDateString();
        });
        return dayTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0) / 3600000;
      });
      
      const weekTotal = weekData.reduce((sum, day) => sum + day, 0);
      weeks.push({
        week: `Week ${4 - i}`,
        total: weekTotal,
        average: weekTotal / 7,
        data: weekData
      });
    }
    
    return weeks;
  };

  const trendData = generateTrendData();
  const weeklyData = generateWeeklyData();
  
  // Calculate moving averages
  const dataWithMovingAverage = trendData.map((item, index) => {
    const windowSize = 7; // 7-day moving average
    const start = Math.max(0, index - windowSize + 1);
    const slice = trendData.slice(start, index + 1);
    const average = slice.reduce((sum, d) => sum + d.time, 0) / slice.length;
    
    return {
      ...item,
      movingAverage: average
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground border border-border p-3 rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          <div className="space-y-1 mt-2">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {entry.name.includes('time') || entry.name.includes('Average') ? 
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
      {/* Daily Time Trend */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            30-Day Activity Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataWithMovingAverage}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `${value}h`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="time"
                  name="Daily Time"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="movingAverage"
                  name="7-day Average"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Session Patterns */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataWithMovingAverage}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  name="Session Count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(var(--primary))" }}
                />
                <Line
                  type="monotone"
                  dataKey="averageSession"
                  name="Avg Session (h)"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(var(--accent))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Comparison */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `${value}h`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="total"
                  name="Total Hours"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendAnalysis;
