
import React, { useState } from 'react';
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, BarChart as BarChartIcon, LineChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WeekViewProps {
  weekData: {
    date: Date;
    day: string;
    totalHours: number;
    timers: number;
  }[];
  formatTime: (ms: number) => string;
  selectedDate: Date | undefined;
}

const WeekView: React.FC<WeekViewProps> = ({ weekData, formatTime, selectedDate }) => {
  // State for week navigation and chart type
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    selectedDate ? startOfWeek(selectedDate) : startOfWeek(new Date())
  );
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

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
        ? subWeeks(prevDate, 1) 
        : addWeeks(prevDate, 1)
    );
  };

  // Calculate average hours per day for reference line
  const averageHours = displayedWeekData.reduce((sum, day) => sum + day.totalHours, 0) / 7;
  
  // Handle bar click to update selected date
  const handleBarClick = (data: any) => {
    if (data && data.date) {
      // We would normally update the selected date here
      // This would be handled by a parent component
      console.log("Selected date:", format(data.date, 'yyyy-MM-dd'));
      // Example of what could happen: onDateSelect(data.date);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
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
            <Tabs defaultValue="bar" className="ml-2">
              <TabsList className="h-8">
                <TabsTrigger 
                  value="bar" 
                  onClick={() => setChartType('bar')}
                  className="px-2 h-7"
                >
                  <BarChartIcon className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger 
                  value="line" 
                  onClick={() => setChartType('line')}
                  className="px-2 h-7"
                >
                  <LineChart className="h-3 w-3" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground mb-2">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </div>
          
          <div className="h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart 
                  data={displayedWeekData} 
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  onClick={(data) => handleBarClick(data?.activePayload?.[0]?.payload)}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--foreground), 0.05)" />
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
                    onMouseOver={(data) => setHoveredDay(data.date)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {displayedWeekData.map((entry, index) => (
                      <motion.rect
                        key={`bar-${index}`}
                        fillOpacity={selectedDate && isSameDay(entry.date, selectedDate) ? 1 : 0.8}
                        fill={selectedDate && isSameDay(entry.date, selectedDate) ? 
                              "rgba(var(--accent), 0.9)" : 
                              hoveredDay && isSameDay(entry.date, hoveredDay) ? 
                              "rgba(var(--primary), 1)" : 
                              "rgba(var(--primary), 0.8)"}
                        animate={{
                          scale: hoveredDay && isSameDay(entry.date, hoveredDay) ? 1.05 : 1
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <LineChart
                  data={displayedWeekData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--foreground), 0.05)" />
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
                  <Bar 
                    dataKey="totalHours" 
                    fill="transparent" 
                    stroke="rgba(var(--primary), 0.8)" 
                    type="monotone" 
                    dot={{ r: 4, fill: "rgba(var(--primary), 0.8)", stroke: "rgba(var(--background), 1)", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "rgba(var(--accent), 0.9)", stroke: "rgba(var(--background), 1)", strokeWidth: 2 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
          
          {/* Day selection indicators */}
          <div className="flex justify-center mt-2 gap-1">
            {displayedWeekData.map((day, index) => (
              <motion.div 
                key={index}
                className={`h-1.5 rounded-full cursor-pointer ${
                  selectedDate && isSameDay(day.date, selectedDate) 
                    ? 'bg-primary w-6' 
                    : 'bg-primary/30 w-4'
                }`}
                whileHover={{ scale: 1.2 }}
                onClick={() => handleBarClick(day)}
              />
            ))}
          </div>
          
          {/* Interactive weekly summary */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <motion.div 
              className="p-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
              whileHover={{ y: -2 }}
            >
              <p className="text-xs text-muted-foreground">Total Time</p>
              <p className="font-medium">{
                formatTime(displayedWeekData.reduce((sum, day) => sum + day.totalHours * 3600000, 0))
              }</p>
            </motion.div>
            <motion.div 
              className="p-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
              whileHover={{ y: -2 }}
            >
              <p className="text-xs text-muted-foreground">Daily Average</p>
              <p className="font-medium">{formatTime(averageHours * 3600000)}</p>
            </motion.div>
            <motion.div 
              className="p-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
              whileHover={{ y: -2 }}
            >
              <p className="text-xs text-muted-foreground">Active Days</p>
              <p className="font-medium">{
                displayedWeekData.filter(day => day.totalHours > 0).length
              }</p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WeekView;
