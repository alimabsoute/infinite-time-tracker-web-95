
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "../types";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subDays, isToday } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Calendar, CalendarDays, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimeChartsProps {
  timers: Timer[];
}

// Helper function to format time
const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Colors for chart elements
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

// Function to get timer status (completed, in progress, overdue)
const getTimerStatus = (timer: Timer): "completed" | "in-progress" | "overdue" => {
  if (timer.isRunning) return "in-progress";
  if (timer.deadline && new Date() > timer.deadline) return "overdue";
  return "completed";
};

const TimeCharts = ({ timers }: TimeChartsProps) => {
  // Prepare data for weekly chart
  const weeklyData = useMemo(() => {
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
    
    const days = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });
    
    return days.map(day => {
      const dayTimers = timers.filter(timer => {
        const timerDate = new Date(timer.createdAt);
        return isSameDay(timerDate, day);
      });
      
      const totalTime = dayTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
      
      return {
        name: format(day, "EEE"),
        value: totalTime / 3600000, // Convert to hours
        date: day,
        timers: dayTimers.length
      };
    });
  }, [timers]);

  // Prepare data for category distribution
  const categoryData = useMemo(() => {
    const categories = new Map<string, number>();
    
    timers.forEach(timer => {
      const category = timer.category || "Uncategorized";
      categories.set(category, (categories.get(category) || 0) + timer.elapsedTime);
    });
    
    return Array.from(categories.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [timers]);

  // Prepare data for status distribution
  const statusData = useMemo(() => {
    const statuses = {
      completed: 0,
      "in-progress": 0,
      overdue: 0
    };
    
    timers.forEach(timer => {
      const status = getTimerStatus(timer);
      statuses[status] += 1;
    });
    
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [timers]);

  // Prepare trend data (last 14 days)
  const trendData = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 14 }, (_, i) => subDays(today, 13 - i));
    
    return days.map(day => {
      const dayTimers = timers.filter(timer => {
        const timerDate = new Date(timer.createdAt);
        return isSameDay(timerDate, day);
      });
      
      const totalTime = dayTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
      
      return {
        name: format(day, "MMM d"),
        value: totalTime / 3600000, // Convert to hours
        date: day
      };
    });
  }, [timers]);

  // Calculate productivity score (simplified version)
  const calculateProductivityScore = (): number => {
    if (timers.length === 0) return 0;
    
    // Calculate total time tracked today
    const todayTimers = timers.filter(timer => {
      const timerDate = new Date(timer.createdAt);
      return isToday(timerDate);
    });
    
    const todayTime = todayTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
    
    // Base score on time tracked (simplified)
    const hoursTracked = todayTime / 3600000;
    
    // Productivity score out of 100
    return Math.min(Math.round((hoursTracked / 8) * 100), 100);
  };

  // Get total tracked time
  const totalTrackedTime = useMemo(() => {
    return timers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
  }, [timers]);

  // Get today's tracked time
  const todayTrackedTime = useMemo(() => {
    const todayTimers = timers.filter(timer => {
      const timerDate = new Date(timer.createdAt);
      return isToday(timerDate);
    });
    
    return todayTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
  }, [timers]);
  
  const productivityScore = calculateProductivityScore();

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="stats-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Time</p>
              <p className="text-2xl font-bold">{formatTime(totalTrackedTime)}</p>
            </div>
            <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-bold">{formatTime(todayTrackedTime)}</p>
            </div>
            <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sessions</p>
              <p className="text-2xl font-bold">{timers.length}</p>
            </div>
            <div className="h-12 w-12 bg-amber-500/10 rounded-full flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Productivity</p>
              <p className="text-2xl font-bold">{productivityScore}%</p>
            </div>
            <div className="h-12 w-12 bg-purple-500/10 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="weekly">
            <Calendar className="mr-2 h-4 w-4" />
            Weekly View
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Activity className="mr-2 h-4 w-4" />
            By Category
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="mr-2 h-4 w-4" />
            Trends
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly">
          <div className="grid grid-cols-1 gap-6">
            <Card className="stats-card">
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Time tracked per day this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-popover text-popover-foreground border border-border p-2 rounded-md shadow-md">
                                <p className="font-medium">{format(data.date, 'MMMM d')}</p>
                                <p className="text-sm">
                                  {formatTime(data.value * 3600000)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {data.timers} {data.timers === 1 ? 'timer' : 'timers'}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="stats-card">
                <CardHeader>
                  <CardTitle>Productivity Score</CardTitle>
                  <CardDescription>Based on today's activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[200px]">
                    <div className="productivity-score mb-2">{productivityScore}%</div>
                    <Progress value={productivityScore} className="h-2 w-1/2 mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {productivityScore < 30 ? "You can do better!" : 
                       productivityScore < 70 ? "Good progress today!" :
                       "Excellent work today!"}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="stats-card">
                <CardHeader>
                  <CardTitle>Timer Status</CardTitle>
                  <CardDescription>Overview of all your timers</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ChartContainer config={{}} className="w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          innerRadius={40}
                          dataKey="value"
                          nameKey="name"
                          paddingAngle={5}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                entry.name === "completed" ? "#10B981" :
                                entry.name === "in-progress" ? "#3B82F6" : "#EF4444"
                              } 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-popover text-popover-foreground border border-border p-2 rounded-md shadow-md">
                                  <p className="font-medium capitalize">{data.name}</p>
                                  <p className="text-sm">{data.value} timers</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="categories">
          <Card className="stats-card">
            <CardHeader>
              <CardTitle>Time by Category</CardTitle>
              <CardDescription>Distribution of time across categories</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {categoryData.map((category, index) => (
                      <div key={category.name} className="space-y-1">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="capitalize">{category.name}</span>
                          </div>
                          <span className="text-sm font-mono">
                            {formatTime(category.value)}
                          </span>
                        </div>
                        <Progress 
                          value={
                            (category.value / categoryData.reduce((sum, item) => sum + item.value, 0)) * 100
                          } 
                          className="h-2"
                          style={{
                            backgroundColor: `${COLORS[index % COLORS.length]}20`,
                            "--tw-progress-filled-bg": COLORS[index % COLORS.length]
                          } as React.CSSProperties}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <ChartContainer config={{}} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          nameKey="name"
                          paddingAngle={3}
                          labelLine={false}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-popover text-popover-foreground border border-border p-2 rounded-md shadow-md">
                                  <p className="font-medium capitalize">{data.name}</p>
                                  <p className="text-sm">
                                    {formatTime(data.value)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {((data.value / categoryData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No categories found. Add categories to your timers to see data here.
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Most active categories */}
          {categoryData.length > 0 && (
            <Card className="stats-card mt-6">
              <CardHeader>
                <CardTitle>Category Insights</CardTitle>
                <CardDescription>Top categories by time tracked</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {categoryData.slice(0, 5).map((category, index) => (
                    <Badge 
                      key={category.name} 
                      variant="secondary"
                      className="flex items-center gap-1 py-1"
                      style={{
                        backgroundColor: `${COLORS[index % COLORS.length]}20`,
                        color: COLORS[index % COLORS.length],
                      }}
                    >
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      {category.name}
                    </Badge>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Top category</span>
                    <span>% of total time</span>
                  </div>
                  {categoryData.slice(0, 5).map((category, index) => (
                    <div key={category.name} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-1 h-10 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <div>
                          <p className="font-medium capitalize">{category.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(category.value)}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium">
                        {((category.value / categoryData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="trends">
          <Card className="stats-card">
            <CardHeader>
              <CardTitle>14-Day Trend</CardTitle>
              <CardDescription>Time tracked over the last two weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      tickFormatter={(value) => {
                        // Only show every other tick
                        return value.split(' ')[1];
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-popover text-popover-foreground border border-border p-2 rounded-md shadow-md">
                              <p className="font-medium">{format(data.date, 'MMMM d')}</p>
                              <p className="text-sm">
                                {formatTime(data.value * 3600000)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              {/* Average time per day */}
              <div className="mt-4 p-4 bg-secondary/20 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Average daily time:</span>
                  <span className="font-mono font-medium">
                    {formatTime(
                      (trendData.reduce((sum, day) => sum + day.value, 0) / trendData.length) * 3600000
                    )}
                  </span>
                </div>
                
                {/* Most active day */}
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm">Most active day:</span>
                  <span className="font-medium">
                    {trendData.reduce((max, day) => max.value > day.value ? max : day, { value: 0 }).name}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Productivity insights */}
          <Card className="stats-card mt-6">
            <CardHeader>
              <CardTitle>Time Insights</CardTitle>
              <CardDescription>Based on your tracking patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Weekly trend</p>
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                      <p className="font-medium">
                        {weeklyData.reduce((sum, day) => sum + day.value, 0).toFixed(1)} hours tracked this week
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Most productive day</p>
                    <p className="font-medium">
                      {
                        weeklyData.reduce((max, day) => max.value > day.value ? max : day, { value: 0, name: 'None' }).name
                      }
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Goal tracking</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Weekly goal (20h)</span>
                        <span>{Math.min(100, weeklyData.reduce((sum, day) => sum + day.value, 0) / 20 * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="goal-progress-bar" 
                          style={{ width: `${Math.min(100, weeklyData.reduce((sum, day) => sum + day.value, 0) / 20 * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-l border-border pl-6 space-y-3">
                  <p className="font-medium mb-2">Time tracking tips</p>
                  <div className="text-sm space-y-3">
                    <p className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                      Track consistently for better analytics
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      Use categories to organize your time
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                      Set deadlines for better productivity
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                      Prioritize tasks for focused work
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeCharts;
