
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Timer } from "../../types";
import { format, startOfWeek, addDays, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Calendar, TrendingUp, Clock, Target } from 'lucide-react';

interface ProductivityHeatmapProps {
  timers: Timer[];
  formatTime: (ms: number) => string;
}

const ProductivityHeatmap: React.FC<ProductivityHeatmapProps> = ({ timers, formatTime }) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'hourly'>('monthly');

  // Generate monthly heatmap data (like GitHub's contribution graph)
  const generateMonthlyHeatmap = () => {
    const now = new Date();
    const startDate = subWeeks(now, 12); // Last 12 weeks
    const data: { date: Date; value: number; level: number }[] = [];
    
    // Generate all days in the range
    for (let i = 0; i < 84; i++) { // 12 weeks * 7 days
      const date = addDays(startDate, i);
      const dayTimers = timers.filter(timer => {
        const timerDate = new Date(timer.createdAt);
        return timerDate.toDateString() === date.toDateString();
      });
      
      const totalTime = dayTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
      
      // Calculate intensity level (0-4)
      let level = 0;
      if (totalTime > 0) {
        if (totalTime < 1800000) level = 1; // < 30 min
        else if (totalTime < 3600000) level = 2; // < 1 hour
        else if (totalTime < 7200000) level = 3; // < 2 hours
        else level = 4; // 2+ hours
      }
      
      data.push({ date, value: totalTime, level });
    }
    
    return data;
  };

  // Generate hourly heatmap for current month
  const generateHourlyHeatmap = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const data: { date: Date; hour: number; value: number; level: number }[][] = [];
    
    days.forEach(date => {
      const dayData: { date: Date; hour: number; value: number; level: number }[] = [];
      
      for (let hour = 0; hour < 24; hour++) {
        const hourStart = new Date(date);
        hourStart.setHours(hour, 0, 0, 0);
        const hourEnd = new Date(date);
        hourEnd.setHours(hour, 59, 59, 999);
        
        const hourTimers = timers.filter(timer => {
          const timerDate = new Date(timer.createdAt);
          return timerDate >= hourStart && timerDate <= hourEnd;
        });
        
        const totalTime = hourTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
        
        let level = 0;
        if (totalTime > 0) {
          if (totalTime < 900000) level = 1; // < 15 min
          else if (totalTime < 1800000) level = 2; // < 30 min
          else if (totalTime < 3600000) level = 3; // < 1 hour
          else level = 4; // 1+ hour
        }
        
        dayData.push({ date, hour, value: totalTime, level });
      }
      
      data.push(dayData);
    });
    
    return data;
  };

  const monthlyData = generateMonthlyHeatmap();
  const hourlyData = generateHourlyHeatmap();

  // Get color for intensity level
  const getColor = (level: number) => {
    const colors = [
      'bg-muted/30', // 0 - no activity
      'bg-primary/20', // 1 - low
      'bg-primary/40', // 2 - medium-low
      'bg-primary/70', // 3 - medium-high
      'bg-primary' // 4 - high
    ];
    return colors[level] || colors[0];
  };

  // Calculate stats
  const calculateStats = () => {
    const activeDays = monthlyData.filter(day => day.value > 0).length;
    const totalTime = monthlyData.reduce((sum, day) => sum + day.value, 0);
    const averageDaily = totalTime / monthlyData.length;
    const streak = calculateCurrentStreak();
    
    return {
      activeDays,
      totalTime,
      averageDaily,
      streak
    };
  };

  const calculateCurrentStreak = () => {
    let streak = 0;
    for (let i = monthlyData.length - 1; i >= 0; i--) {
      if (monthlyData[i].value > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Productivity Heatmap</h3>
          <p className="text-sm text-muted-foreground">
            Visual representation of your activity patterns
          </p>
        </div>
        <Select value={viewMode} onValueChange={(value: 'monthly' | 'hourly') => setViewMode(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="hourly">Hourly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.activeDays}</p>
            <p className="text-xs text-muted-foreground">Active Days</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{formatTime(stats.totalTime)}</p>
            <p className="text-xs text-muted-foreground">Total Time</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{formatTime(stats.averageDaily)}</p>
            <p className="text-xs text-muted-foreground">Daily Avg</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{stats.streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-lg">
            {viewMode === 'monthly' ? 'Last 12 Weeks' : 'Current Month Hourly'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === 'monthly' ? (
            <div className="space-y-4">
              {/* Week labels */}
              <div className="grid grid-cols-12 gap-1 text-xs text-muted-foreground mb-2">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="text-center">
                    {format(subWeeks(new Date(), 11 - i), 'MMM')}
                  </div>
                ))}
              </div>
              
              {/* Day labels */}
              <div className="flex gap-1">
                <div className="w-8 space-y-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-xs text-muted-foreground h-3 flex items-center">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Heatmap grid */}
                <div className="grid grid-cols-12 gap-1">
                  {Array.from({ length: 12 }, (_, weekIndex) => (
                    <div key={weekIndex} className="space-y-1">
                      {Array.from({ length: 7 }, (_, dayIndex) => {
                        const dataIndex = weekIndex * 7 + dayIndex;
                        const dayData = monthlyData[dataIndex];
                        
                        if (!dayData) return <div key={dayIndex} className="w-3 h-3" />;
                        
                        return (
                          <div
                            key={dayIndex}
                            className={`w-3 h-3 rounded-sm ${getColor(dayData.level)} border border-border/30 cursor-pointer hover:scale-110 transition-transform`}
                            title={`${format(dayData.date, 'MMM d')}: ${formatTime(dayData.value)}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 overflow-x-auto">
              {/* Hour labels */}
              <div className="flex gap-1">
                <div className="w-16"></div>
                {Array.from({ length: 24 }, (_, hour) => (
                  <div key={hour} className="w-4 text-xs text-muted-foreground text-center">
                    {hour % 4 === 0 ? hour : ''}
                  </div>
                ))}
              </div>
              
              {/* Days */}
              {hourlyData.map((dayData, dayIndex) => (
                <div key={dayIndex} className="flex gap-1">
                  <div className="w-16 text-xs text-muted-foreground flex items-center">
                    {format(dayData[0].date, 'MMM d')}
                  </div>
                  {dayData.map((hourData, hourIndex) => (
                    <div
                      key={hourIndex}
                      className={`w-4 h-4 rounded-sm ${getColor(hourData.level)} border border-border/30 cursor-pointer hover:scale-110 transition-transform`}
                      title={`${format(hourData.date, 'MMM d')} ${hourData.hour}:00 - ${formatTime(hourData.value)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
          
          {/* Legend */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">Less active</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getColor(level)} border border-border/30`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">More active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductivityHeatmap;
