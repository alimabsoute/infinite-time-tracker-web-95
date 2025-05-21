import { useMemo, useState } from "react";
import { Timer, TimerChartData, CategoryChartData } from "../types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  TooltipProps,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { Download, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

// Custom tooltip for the bar chart
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    // Format the time for the tooltip (hours:minutes:seconds)
    const timeString = formatTime(data.time);
    
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-md">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm">{timeString}</p>
        {data.category && <p className="text-xs text-gray-500">{data.category}</p>}
      </div>
    );
  }
  
  return null;
};

// Custom tooltip for the pie chart
const CustomPieTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-md">
        <p className="font-medium">{data.category}</p>
        <p className="text-sm">{formatTime(data.time)}</p>
        <p className="text-xs">{Math.round(data.percentage)}% of total</p>
      </div>
    );
  }
  
  return null;
};

// View options for the charts
type ChartView = 'bar' | 'pie' | 'table';

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

const TimeCharts = ({ timers }: TimeChartsProps) => {
  const [chartView, setChartView] = useState<ChartView>('bar');
  const [timeRange, setTimeRange] = useState<string>('all');
  
  // Add sample data if no timers with elapsed time
  const hasData = timers.some(timer => timer.elapsedTime > 0);
  
  // Filter timers based on selected time range
  const filteredTimers = useMemo(() => {
    if (timeRange === 'all') return timers;
    
    const now = new Date();
    const msInDay = 24 * 60 * 60 * 1000;
    
    switch (timeRange) {
      case 'today':
        // Only timers from today (midnight to now)
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        return timers.filter(timer => 
          new Date(timer.createdAt) >= today || timer.isRunning
        );
      case 'week':
        // Timers from the last 7 days
        const weekAgo = new Date(now.getTime() - 7 * msInDay);
        return timers.filter(timer => 
          new Date(timer.createdAt) >= weekAgo || timer.isRunning
        );
      case 'month':
        // Timers from the last 30 days
        const monthAgo = new Date(now.getTime() - 30 * msInDay);
        return timers.filter(timer => 
          new Date(timer.createdAt) >= monthAgo || timer.isRunning
        );
      default:
        return timers;
    }
  }, [timers, timeRange]);
  
  // Prepare data for the bar chart
  const barChartData: TimerChartData[] = useMemo(() => {
    // If we have real data, use it
    if (filteredTimers.some(timer => timer.elapsedTime > 0)) {
      return filteredTimers
        .filter(timer => timer.elapsedTime > 0)
        .map(timer => ({
          name: timer.name,
          time: timer.elapsedTime,
          category: timer.category || 'Uncategorized'
        }))
        .sort((a, b) => b.time - a.time); // Sort by time descending
    }
    
    // Otherwise return empty array (will show "No timer data" message)
    return [];
  }, [filteredTimers]);
  
  // Prepare data for the pie chart (by category)
  const categoryChartData: CategoryChartData[] = useMemo(() => {
    const timersWithTime = filteredTimers.filter(t => t.elapsedTime > 0);
    
    if (!timersWithTime.length) return [];
    
    // Calculate total time across all timers
    const totalTime = timersWithTime.reduce((sum, timer) => sum + timer.elapsedTime, 0);
    
    // Group by category
    const categoryMap = new Map<string, number>();
    
    timersWithTime.forEach(timer => {
      const category = timer.category || 'Uncategorized';
      const currentTime = categoryMap.get(category) || 0;
      categoryMap.set(category, currentTime + timer.elapsedTime);
    });
    
    // Convert map to array and calculate percentages
    return Array.from(categoryMap.entries())
      .map(([category, time]) => ({
        category,
        time,
        percentage: (time / totalTime) * 100,
      }))
      .sort((a, b) => b.time - a.time);
  }, [filteredTimers]);
  
  // Export data as CSV
  const exportToCSV = () => {
    // Prepare CSV content
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
    
    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set filename based on time range
    let filename = 'timer-data';
    if (timeRange !== 'all') filename += `-${timeRange}`;
    filename += '.csv';
    
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Calculate summary statistics
  const totalTime = filteredTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
  const activeTimers = filteredTimers.filter(timer => timer.isRunning).length;
  const uniqueCategories = new Set(filteredTimers.map(timer => timer.category || 'Uncategorized')).size;
  const avgTimePerTimer = filteredTimers.length ? totalTime / filteredTimers.length : 0;

  return (
    <div className="space-y-4">
      <Card className="p-4 shadow-md mt-6 bg-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Time Distribution</h2>
          
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex border rounded-md overflow-hidden">
              <Button 
                variant={chartView === 'bar' ? "default" : "ghost"} 
                size="sm"
                onClick={() => setChartView('bar')}
                className="rounded-none"
              >
                <BarChart3 size={18} />
              </Button>
              <Button 
                variant={chartView === 'pie' ? "default" : "ghost"} 
                size="sm"
                onClick={() => setChartView('pie')}
                className="rounded-none"
              >
                <PieChartIcon size={18} />
              </Button>
              <Button 
                variant={chartView === 'table' ? "default" : "ghost"} 
                size="sm"
                onClick={() => setChartView('table')}
                className="rounded-none"
              >
                <span className="font-mono">T</span>
              </Button>
            </div>
            
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
        
        {/* Chart or No Data Message */}
        <div className="chart-container" style={{ height: '400px' }}>
          {!hasData ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-center text-muted-foreground mb-4">No timer data available yet.</p>
              <p className="text-center text-muted-foreground">Create a timer and track some time to see statistics here.</p>
            </div>
          ) : (
            <>
              {chartView === 'bar' && barChartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={barChartData} 
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
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="time" radius={[0, 4, 4, 0]}>
                      {barChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={chartColors[index % chartColors.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              
              {chartView === 'pie' && categoryChartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="time"
                      nameKey="category"
                      label={({ category, percentage }) => `${category}: ${Math.round(percentage)}%`}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
              
              {chartView === 'table' && barChartData.length > 0 && (
                <div className="overflow-auto max-h-[400px]">
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
                      {barChartData.map((timer, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{timer.name}</TableCell>
                          <TableCell>{timer.category}</TableCell>
                          <TableCell>{formatTime(timer.time)}</TableCell>
                          <TableCell>
                            {filteredTimers.find(t => t.name === timer.name)?.createdAt.toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {/* If view selected but no data in that format */}
              {((chartView === 'bar' && barChartData.length === 0) ||
                 (chartView === 'pie' && categoryChartData.length === 0) ||
                 (chartView === 'table' && barChartData.length === 0)) && (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-center text-muted-foreground">No data available for this view.</p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
      
      {/* Summary Statistics Cards - More Visible Now */}
      <Card className="p-4 shadow-md bg-card">
        <h2 className="text-xl font-semibold mb-4">Summary Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stats-card bg-indigo-900/30 p-4 rounded-lg border border-indigo-800/50">
            <h3 className="text-sm text-indigo-300 font-medium">Total Time</h3>
            <p className="text-2xl font-bold">
              {formatTime(totalTime)}
            </p>
          </div>
          
          <div className="stats-card bg-pink-900/30 p-4 rounded-lg border border-pink-800/50">
            <h3 className="text-sm text-pink-300 font-medium">Active Timers</h3>
            <p className="text-2xl font-bold">
              {activeTimers}
            </p>
          </div>
          
          <div className="stats-card bg-amber-900/30 p-4 rounded-lg border border-amber-800/50">
            <h3 className="text-sm text-amber-300 font-medium">Categories</h3>
            <p className="text-2xl font-bold">
              {uniqueCategories}
            </p>
          </div>
          
          <div className="stats-card bg-emerald-900/30 p-4 rounded-lg border border-emerald-800/50">
            <h3 className="text-sm text-emerald-300 font-medium">Avg Time/Timer</h3>
            <p className="text-2xl font-bold">
              {formatTimeForAxis(avgTimePerTimer)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TimeCharts;
