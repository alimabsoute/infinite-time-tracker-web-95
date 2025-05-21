
import { useMemo, useState } from "react";
import { Timer } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  TooltipProps
} from "recharts";
import { BarChart3, Calendar, ChartLine, Download, List, TrendingDown, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TimeChartsProps {
  timers: Timer[];
}

// Format time for display on chart
const formatTimeForAxis = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Format time in hours:minutes:seconds
const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
};

// Enhanced color palette for charts
const chartColors = [
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#14B8A6", // Teal
];

// Date formatter for charts
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Custom tooltip for the bar chart
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-md">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm">{formatTime(data.time)}</p>
        {data.category && <p className="text-xs text-gray-500">{data.category}</p>}
      </div>
    );
  }
  
  return null;
};

// Chart view options
type ChartView = 'time-trend' | 'category-distribution' | 'table';

const TimeCharts = ({ timers }: TimeChartsProps) => {
  const [chartView, setChartView] = useState<ChartView>('time-trend');
  const [timeRange, setTimeRange] = useState<string>('week');
  
  // Filter timers based on selected time range
  const filteredTimers = useMemo(() => {
    if (timeRange === 'all') return timers;
    
    const now = new Date();
    const msInDay = 24 * 60 * 60 * 1000;
    
    switch (timeRange) {
      case 'today':
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        return timers.filter(timer => 
          new Date(timer.createdAt) >= today || timer.isRunning
        );
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * msInDay);
        return timers.filter(timer => 
          new Date(timer.createdAt) >= weekAgo || timer.isRunning
        );
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * msInDay);
        return timers.filter(timer => 
          new Date(timer.createdAt) >= monthAgo || timer.isRunning
        );
      default:
        return timers;
    }
  }, [timers, timeRange]);

  // Check if we have any data
  const hasData = filteredTimers.some(timer => timer.elapsedTime > 0);
  
  // Prepare data for the category distribution chart
  const categoryData = useMemo(() => {
    if (!filteredTimers.length) return [];
    
    const categoryMap = new Map<string, number>();
    
    filteredTimers.forEach(timer => {
      const category = timer.category || 'Uncategorized';
      const currentTime = categoryMap.get(category) || 0;
      categoryMap.set(category, currentTime + timer.elapsedTime);
    });
    
    return Array.from(categoryMap.entries())
      .map(([name, time]) => ({ name, time }))
      .sort((a, b) => b.time - a.time);
  }, [filteredTimers]);
  
  // Prepare data for the time trend chart
  const trendData = useMemo(() => {
    if (!filteredTimers.length) return [];
    
    const days = timeRange === 'today' ? 1 : 
                timeRange === 'week' ? 7 : 
                timeRange === 'month' ? 30 : 30;
    
    const now = new Date();
    const result = [];
    
    // Create data points for each day
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      // Sum up time for all timers on this day
      const dayTime = filteredTimers.reduce((sum, timer) => {
        const timerDate = new Date(timer.createdAt);
        if (timerDate >= date && timerDate < nextDate) {
          return sum + timer.elapsedTime;
        }
        return sum;
      }, 0);
      
      result.push({
        date: formatDate(date),
        time: dayTime,
        rawDate: date
      });
    }
    
    return result;
  }, [filteredTimers, timeRange]);
  
  // Export data as CSV
  const exportToCSV = () => {
    const headers = "Name,Category,Time (seconds),Created At\n";
    
    const csvContent = filteredTimers.reduce((csv, timer) => {
      const row = [
        `"${timer.name}"`,
        `"${timer.category || 'Uncategorized'}"`,
        Math.floor(timer.elapsedTime / 1000),
        new Date(timer.createdAt).toISOString()
      ].join(',');
      
      return csv + row + '\n';
    }, headers);
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    let filename = 'timer-data';
    if (timeRange !== 'all') filename += `-${timeRange}`;
    filename += '.csv';
    
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Calculate KPI metrics
  const metrics = useMemo(() => {
    if (!filteredTimers.length) {
      return {
        totalTime: 0,
        activeTimers: 0,
        categories: 0,
        avgTimePerTimer: 0,
        focusTime: 0,
        mostActiveCategory: '',
        productivityScore: 0
      };
    }
    
    const totalTime = filteredTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
    const activeTimers = filteredTimers.filter(timer => timer.isRunning).length;
    
    // Find unique categories
    const uniqueCategories = new Set(
      filteredTimers.map(timer => timer.category || 'Uncategorized')
    );
    
    // Calculate longest session (focus time)
    const focusTime = Math.max(...filteredTimers.map(timer => timer.elapsedTime));
    
    // Find most active category
    const categoryTimes = new Map<string, number>();
    filteredTimers.forEach(timer => {
      const category = timer.category || 'Uncategorized';
      const current = categoryTimes.get(category) || 0;
      categoryTimes.set(category, current + timer.elapsedTime);
    });
    
    let mostActiveCategory = 'None';
    let maxCategoryTime = 0;
    
    categoryTimes.forEach((time, category) => {
      if (time > maxCategoryTime) {
        maxCategoryTime = time;
        mostActiveCategory = category;
      }
    });
    
    // Calculate productivity score (0-100)
    // Based on ratio of active timers and total time tracked
    const maxPossibleTime = filteredTimers.length * (24 * 60 * 60 * 1000); // 24h per timer
    const productivityScore = Math.min(
      Math.round((totalTime / (maxPossibleTime || 1)) * 100), 100
    );
    
    return {
      totalTime,
      activeTimers,
      categories: uniqueCategories.size,
      avgTimePerTimer: filteredTimers.length ? totalTime / filteredTimers.length : 0,
      focusTime,
      mostActiveCategory,
      productivityScore
    };
  }, [filteredTimers]);

  return (
    <div className="space-y-4">
      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-indigo-900/20">
          <CardHeader className="pb-2">
            <CardDescription>Total Time</CardDescription>
            <CardTitle className="text-2xl flex justify-between">
              {formatTime(metrics.totalTime)}
              <span className="text-indigo-400">
                <Calendar className="h-6 w-6" />
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-emerald-900/20">
          <CardHeader className="pb-2">
            <CardDescription>Productivity Score</CardDescription>
            <CardTitle className="text-2xl flex justify-between">
              {metrics.productivityScore}%
              <span className={cn(
                "flex items-center",
                metrics.productivityScore > 50 ? "text-emerald-400" : "text-amber-400"
              )}>
                {metrics.productivityScore > 50 ? 
                  <TrendingUp className="h-6 w-6" /> : 
                  <TrendingDown className="h-6 w-6" />}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-purple-900/20">
          <CardHeader className="pb-2">
            <CardDescription>Focus Time</CardDescription>
            <CardTitle className="text-2xl flex justify-between">
              {formatTimeForAxis(metrics.focusTime)}
              <span className="text-purple-400">
                <ChartLine className="h-6 w-6" />
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-pink-900/20">
          <CardHeader className="pb-2">
            <CardDescription>Top Category</CardDescription>
            <CardTitle className="text-xl flex justify-between items-center truncate">
              {metrics.mostActiveCategory}
              <span className="text-pink-400">
                <List className="h-6 w-6" />
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Section */}
      <Card className="shadow-md mt-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Time Analytics</CardTitle>
            
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToCSV}
                title="Export as CSV"
              >
                <Download size={18} />
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="time-trend" value={chartView} onValueChange={(v) => setChartView(v as ChartView)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="time-trend" className="flex items-center gap-2">
                <ChartLine size={16} />
                <span className="hidden sm:inline">Trends</span>
              </TabsTrigger>
              <TabsTrigger value="category-distribution" className="flex items-center gap-2">
                <BarChart3 size={16} />
                <span className="hidden sm:inline">Categories</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <List size={16} />
                <span className="hidden sm:inline">Details</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="px-2">
          <div className="chart-container h-[400px]">
            {!hasData ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-center text-muted-foreground mb-4">No timer data available yet.</p>
                <p className="text-center text-muted-foreground">Create a timer and track some time to see statistics here.</p>
              </div>
            ) : (
              <>
                {/* Time Trend Chart */}
                {chartView === 'time-trend' && (
                  <ChartContainer config={{}} className="h-[350px]">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                      />
                      <YAxis 
                        tickFormatter={formatTimeForAxis}
                        width={80}
                        tickLine={false}
                        style={{ fontSize: '0.8rem' }}
                      />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <ChartTooltipContent>
                                <div className="flex flex-col">
                                  <span className="font-medium">{label}</span>
                                  <span>{formatTime(payload[0].value as number)}</span>
                                </div>
                              </ChartTooltipContent>
                            )
                          }
                          return null
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="time" 
                        stroke="#6366F1" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ChartContainer>
                )}
                
                {/* Category Distribution Chart */}
                {chartView === 'category-distribution' && (
                  <ChartContainer config={{}} className="h-[350px]">
                    <BarChart 
                      data={categoryData}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis 
                        type="number" 
                        tickFormatter={formatTimeForAxis} 
                        domain={[0, 'dataMax']} 
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={80} 
                        tickLine={false}
                        style={{ fontSize: '0.8rem' }}
                      />
                      <ChartTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <ChartTooltipContent>
                                <div className="flex flex-col">
                                  <span className="font-medium">{label}</span>
                                  <span>{formatTime(payload[0].value as number)}</span>
                                </div>
                              </ChartTooltipContent>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="time" radius={[0, 4, 4, 0]}>
                        {categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={chartColors[index % chartColors.length]} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                )}
                
                {/* Table View */}
                {chartView === 'table' && (
                  <div className="overflow-auto max-h-[350px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timer</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTimers
                          .sort((a, b) => b.elapsedTime - a.elapsedTime)
                          .map((timer) => (
                            <TableRow key={timer.id}>
                              <TableCell className="font-medium">{timer.name}</TableCell>
                              <TableCell>{timer.category || 'Uncategorized'}</TableCell>
                              <TableCell>{formatTime(timer.elapsedTime)}</TableCell>
                              <TableCell>
                                {timer.createdAt.toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeCharts;
