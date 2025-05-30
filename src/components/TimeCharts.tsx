
import React, { useMemo } from 'react';
import { Timer } from '../types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, differenceInDays, addDays } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BarChart2, ChevronDown, Clock, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { HeatMapGrid } from './ui/heat-map';

type Props = {
  timers: Timer[];
};

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6b7280'];
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_RANGES = [
  '12am-2am', '2am-4am', '4am-6am', '6am-8am', '8am-10am', '10am-12pm',
  '12pm-2pm', '2pm-4pm', '4pm-6pm', '6pm-8pm', '8pm-10pm', '10pm-12am'
];

const TimeCharts: React.FC<Props> = ({ timers }) => {
  const today = new Date();
  
  // Get start and end of current week
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 });
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 0 });
  
  // Function to get timers for a specific day
  const getTimersForDay = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return timers.filter(timer => {
      const timerDate = new Date(timer.createdAt);
      return timerDate >= startOfDay && timerDate <= endOfDay;
    });
  };
  
  // Weekly data
  const weeklyData = useMemo(() => {
    return eachDayOfInterval({
      start: startOfCurrentWeek,
      end: endOfCurrentWeek
    }).map(day => {
      const dayTimers = getTimersForDay(day);
      const totalTime = dayTimers.reduce((total, timer) => total + timer.elapsedTime, 0);
      
      return {
        day: format(day, 'EEE'),
        date: day,
        hours: totalTime / 3600000, // Convert ms to hours
        timers: dayTimers.length
      };
    });
  }, [timers]);
  
  // Category distribution data
  const categoryData = useMemo(() => {
    const categories = new Map<string, number>();
    
    timers.forEach(timer => {
      const category = timer.category || 'Uncategorized';
      categories.set(category, (categories.get(category) || 0) + timer.elapsedTime);
    });
    
    return Array.from(categories.entries())
      .map(([name, value]) => ({ name, value: value / 3600000 })) // Convert to hours
      .sort((a, b) => b.value - a.value);
  }, [timers]);
  
  // Time of day heatmap data
  const timeOfDayData = useMemo(() => {
    // Initialize heatmap data structure (7 days x 12 time ranges)
    const heatmapData: { day: number; hour: number; value: number }[] = [];
    
    // Create empty grid
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 12; hour++) {
        heatmapData.push({ day, hour, value: 0 });
      }
    }
    
    // Fill in data from timers
    timers.forEach(timer => {
      const date = new Date(timer.createdAt);
      const day = date.getDay(); // 0-6
      const hour = Math.floor(date.getHours() / 2); // 0-11 (2-hour blocks)
      
      // Find the correct cell and add timer duration
      const index = day * 12 + hour;
      if (index >= 0 && index < heatmapData.length) {
        heatmapData[index].value += timer.elapsedTime / 3600000; // hours
      }
    });
    
    return heatmapData;
  }, [timers]);
  
  // Top performers data
  const topTimersData = useMemo(() => {
    return [...timers]
      .sort((a, b) => b.elapsedTime - a.elapsedTime)
      .slice(0, 5)
      .map(timer => ({
        name: timer.name,
        time: timer.elapsedTime / 3600000,
        category: timer.category || 'Uncategorized'
      }));
  }, [timers]);
  
  // Most focused times
  const focusedTimes = useMemo(() => {
    const hourlyData = Array(24).fill(0);
    
    timers.forEach(timer => {
      const date = new Date(timer.createdAt);
      const hour = date.getHours();
      hourlyData[hour] += timer.elapsedTime;
    });
    
    // Find the hour with the most time tracked
    let maxHour = 0;
    let maxTime = 0;
    
    hourlyData.forEach((time, hour) => {
      if (time > maxTime) {
        maxTime = time;
        maxHour = hour;
      }
    });
    
    return {
      hour: maxHour,
      formattedHour: maxHour === 0 || maxHour === 12 ? 12 : maxHour % 12,
      amPm: maxHour >= 12 ? 'PM' : 'AM',
      time: maxTime / 3600000
    };
  }, [timers]);
  
  // Format time helper function
  const formatTime = (hours: number): string => {
    const wholePart = Math.floor(hours);
    const minutePart = Math.round((hours - wholePart) * 60);
    
    if (wholePart > 0) {
      return `${wholePart}h ${minutePart > 0 ? `${minutePart}m` : ''}`;
    }
    return `${minutePart}m`;
  };
  
  // Calculate total tracked time
  const totalTrackedHours = timers.reduce((total, timer) => total + timer.elapsedTime, 0) / 3600000;
  
  const categories = Array.from(new Set(timers.map(t => t.category || 'Uncategorized')));
  const uniqueDays = Array.from(new Set(timers.map(t => 
    format(new Date(t.createdAt), 'yyyy-MM-dd')
  ))).length;
  
  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const hours = payload[0].value;
      return (
        <div className="bg-popover border border-border p-2 rounded-md text-popover-foreground">
          <p className="font-medium">{label}</p>
          <p>Time: {formatTime(hours)}</p>
          <p className="text-xs text-muted-foreground">
            {payload[0].payload.timers} {payload[0].payload.timers === 1 ? 'timer' : 'timers'}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border p-2 rounded-md text-popover-foreground">
          <p className="font-medium">{data.name}</p>
          <p>Time: {formatTime(data.value)}</p>
          <p className="text-xs text-muted-foreground">
            {((data.value / totalTrackedHours) * 100).toFixed(0)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/60 border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 p-2 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-medium">Total Time</h3>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">
                {formatTime(totalTrackedHours)}
              </p>
              <p className="text-xs text-muted-foreground">
                Across {timers.length} sessions
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60 border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-500/20 p-2 rounded-full">
                <Activity className="h-5 w-5 text-indigo-500" />
              </div>
              <h3 className="text-sm font-medium">Active Days</h3>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{uniqueDays}</p>
              <p className="text-xs text-muted-foreground">
                Days with tracked time
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60 border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="bg-purple-500/20 p-2 rounded-full">
                <PieChartIcon className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="text-sm font-medium">Categories</h3>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-xs text-muted-foreground">
                Different types of activities
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/60 border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500/20 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <h3 className="text-sm font-medium">Peak Hour</h3>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">
                {focusedTimes.formattedHour}{focusedTimes.amPm}
              </p>
              <p className="text-xs text-muted-foreground">
                Most productive time
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="productivity">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="productivity" className="text-xs">
              <BarChart2 className="h-4 w-4 mr-1" />
              Productivity
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs">
              <PieChartIcon className="h-4 w-4 mr-1" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">
              <Activity className="h-4 w-4 mr-1" />
              Insights
            </TabsTrigger>
          </TabsList>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                This Week
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>This Week</DropdownMenuItem>
              <DropdownMenuItem>Last Week</DropdownMenuItem>
              <DropdownMenuItem>This Month</DropdownMenuItem>
              <DropdownMenuItem>All Time</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <TabsContent value="productivity" className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/60 border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weekly Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%" className="p-4">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/60 border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Productivity Heatmap</CardTitle>
              </CardHeader>
              <CardContent className="pb-0">
                <p className="text-xs text-muted-foreground mb-6">
                  Time tracked throughout the week by day and time
                </p>
                
                <div className="pl-6 pb-4 pt-2">
                  <HeatMapGrid
                    data={timeOfDayData}
                    xLabels={TIME_RANGES}
                    yLabels={DAYS_OF_WEEK}
                    cellHeight="22px"
                    cellWidth="42px"
                    cellRadius={2}
                    xLabelsPos="top"
                    yLabelsPos="left"
                    cellStyle={(x, y, value) => ({
                      background: `rgba(99, 102, 241, ${Math.min(value, 2) / 2})`,
                      fontSize: '8px',
                      color: value > 1 ? '#fff' : '#666',
                    })}
                    cellRender={(x, y, value) => value ? (value).toFixed(1) : ''}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <Card className="bg-card/60 border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top Timers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topTimersData.length > 0 ? (
                    topTimersData.map((timer, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-12 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <p className="font-medium">{timer.name}</p>
                            <p className="text-xs text-muted-foreground">{timer.category}</p>
                          </div>
                        </div>
                        <p className="font-mono font-medium">{formatTime(timer.time)}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No timer data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="categories" className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card className="bg-card/60 border-border/60 md:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={90}
                        innerRadius={40}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/60 border-border/60 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryData.map((category, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span>{category.name}</span>
                        </div>
                        <span className="font-mono">{formatTime(category.value)}</span>
                      </div>
                      <div className="w-full bg-secondary/20 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (category.value / totalTrackedHours) * 100)}%`,
                            backgroundColor: COLORS[index % COLORS.length] 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/60 border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Productivity Score</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <div className="text-3xl font-bold productivity-score mb-2">
                  {Math.min(100, Math.floor(totalTrackedHours / 40 * 100))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {formatTime(totalTrackedHours)} tracked over {uniqueDays} days
                </p>
                
                <div className="w-full mt-6 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>Excellent</span>
                  </div>
                  <div className="w-full bg-secondary/20 rounded-full h-2">
                    <div 
                      className="goal-progress-bar h-2 rounded-full" 
                      style={{ width: `${Math.min(100, Math.floor(totalTrackedHours / 40 * 100))}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/60 border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Productivity Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <div className="bg-primary/20 p-1 rounded-full">
                      <Clock className="h-3 w-3 text-primary" />
                    </div>
                    Most Productive Time
                  </div>
                  <p className="text-sm">
                    Your most productive time is around{' '}
                    <span className="font-semibold">{focusedTimes.formattedHour} {focusedTimes.amPm}</span>
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <div className="bg-purple-500/20 p-1 rounded-full">
                      <Activity className="h-3 w-3 text-purple-500" />
                    </div>
                    Top Category
                  </div>
                  {categoryData.length > 0 ? (
                    <p className="text-sm">
                      <span className="font-semibold">{categoryData[0].name}</span> takes most of your time
                      ({((categoryData[0].value / totalTrackedHours) * 100).toFixed(0)}%)
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No category data available</p>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <div className="bg-emerald-500/20 p-1 rounded-full">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                    </div>
                    Consistency
                  </div>
                  <p className="text-sm">
                    You tracked time on {uniqueDays} days this month
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeCharts;
