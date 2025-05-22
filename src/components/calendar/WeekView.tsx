
import React, { useState } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface WeekViewProps {
  weekData: {
    date: Date;
    day: string;
    totalHours: number;
    timers: number;
  }[];
  formatTime: (ms: number) => string;
  selectedDate: Date | undefined;  // Updated to match how it's used
}

const WeekView: React.FC<WeekViewProps> = ({ weekData, formatTime, selectedDate }) => {
  // State for week navigation
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    selectedDate ? startOfWeek(selectedDate) : startOfWeek(new Date())
  );

  // Generate week data based on current week start
  const generateWeekData = (startDate: Date) => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(startDate, i);
      const dayData = weekData.find(item => 
        format(item.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      ) || {
        date,
        day: format(date, 'EEE'),
        totalHours: 0,
        timers: 0
      };
      
      return dayData;
    });
  };

  const displayedWeekData = generateWeekData(currentWeekStart);
  
  // Navigate to previous/next week
  const navigateWeek = (direction: 'previous' | 'next') => {
    setCurrentWeekStart(prevDate => 
      direction === 'previous' 
        ? addDays(prevDate, -7) 
        : addDays(prevDate, 7)
    );
  };

  // Calculate average hours per day for reference line
  const averageHours = displayedWeekData.reduce((sum, day) => sum + day.totalHours, 0) / 7;
  
  return (
    <Card className="glass-effect mt-6 border border-border/30 shadow-lg transition-all duration-300 hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock size={16} className="text-primary" /> 
          Weekly Activity
        </CardTitle>
        <div className="flex gap-1">
          <Button 
            onClick={() => navigateWeek('previous')} 
            size="sm" 
            variant="outline" 
            className="h-8 w-8 p-0 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => navigateWeek('next')} 
            size="sm" 
            variant="outline" 
            className="h-8 w-8 p-0 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center text-sm text-muted-foreground mb-2">
          {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayedWeekData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(var(--foreground), 0.1)' }}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(var(--foreground), 0.1)' }}
                tickFormatter={(value) => `${value}h`}
              />
              <ReferenceLine 
                y={averageHours} 
                stroke="rgba(var(--primary), 0.5)" 
                strokeDasharray="3 3" 
                label={{ 
                  value: 'Avg', 
                  position: 'insideTopRight', 
                  fill: 'rgba(var(--primary), 0.8)',
                  fontSize: 10
                }} 
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover text-popover-foreground border border-border p-3 rounded-md shadow-md">
                        <p className="font-medium">{format(data.date, 'MMMM d')}</p>
                        <p className="text-sm mt-1">
                          {formatTime(data.totalHours * 3600000)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {data.timers} {data.timers === 1 ? 'timer' : 'timers'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar 
                dataKey="totalHours" 
                fill="rgba(var(--primary), 0.8)" 
                radius={[4, 4, 0, 0]}
                animationDuration={800}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekView;
