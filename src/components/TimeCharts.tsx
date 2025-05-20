
import { useMemo } from "react";
import { Timer, TimerChartData } from "../types";
import { Card } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  TooltipProps
} from "recharts";

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

// Custom tooltip for the bar chart
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    // Format the time for the tooltip (hours:minutes:seconds)
    const totalSeconds = Math.floor(data.time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const timeString = [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0")
    ].join(":");
    
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-md">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm">{timeString}</p>
      </div>
    );
  }
  
  return null;
};

const TimeCharts = ({ timers }: TimeChartsProps) => {
  // Only show chart if we have timers with time
  const hasData = timers.some(timer => timer.elapsedTime > 0);
  
  // Prepare data for the chart
  const chartData: TimerChartData[] = useMemo(() => {
    return timers
      .filter(timer => timer.elapsedTime > 0)
      .map(timer => ({
        name: timer.name,
        time: timer.elapsedTime,
      }))
      .sort((a, b) => b.time - a.time); // Sort by time descending
  }, [timers]);
  
  if (!hasData) {
    return null;
  }
  
  // Generate colors for bars
  const colors = [
    "#3b82f6", // blue-500
    "#6366f1", // indigo-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
  ];

  return (
    <Card className="p-4 shadow-md mt-6 bg-white dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4">Time Distribution</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
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
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TimeCharts;
