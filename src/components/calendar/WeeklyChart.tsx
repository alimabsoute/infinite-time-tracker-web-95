
import React from 'react';
import { isSameDay, format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { WeeklyChartTooltip, getChartConfig } from './WeeklyChartConfig';

interface WeekData {
  date: Date;
  day: string;
  totalHours: number;
  timers: number;
}

interface WeeklyChartProps {
  weekData: WeekData[];
  chartType: 'bar' | 'line';
  selectedDate: Date;
  averageHours: number;
  hoveredDay: Date | null;
  onHoverDay: (date: Date | null) => void;
  onBarClick: (data: any) => void;
  formatTime: (ms: number) => string;
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({
  weekData,
  chartType,
  selectedDate,
  averageHours,
  hoveredDay,
  onHoverDay,
  onBarClick,
  formatTime
}) => {
  const config = getChartConfig(averageHours);

  // Enhanced debug logging
  console.log('🔍 WeeklyChart - Rendering with data:', {
    weekDataLength: weekData.length,
    averageHours: averageHours.toFixed(3),
    chartType,
    selectedDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'none',
    weekData: weekData.map(d => ({
      day: d.day,
      date: format(d.date, 'yyyy-MM-dd'),
      totalHours: d.totalHours.toFixed(3),
      timers: d.timers,
      hasData: d.totalHours > 0
    }))
  });

  // Check for data validity
  const hasAnyData = weekData.some(d => d.totalHours > 0);
  const maxHours = Math.max(...weekData.map(d => d.totalHours), 0);
  
  console.log('🔍 WeeklyChart - Data analysis:', {
    hasAnyData,
    maxHours: maxHours.toFixed(3),
    totalWeekHours: weekData.reduce((sum, d) => sum + d.totalHours, 0).toFixed(3)
  });

  if (!hasAnyData) {
    console.log('⚠️ WeeklyChart - No data to display');
  }

  const handleChartClick = (data: any) => {
    console.log('🔍 WeeklyChart - Chart clicked:', data);
    if (data?.activePayload?.[0]?.payload) {
      const payload = data.activePayload[0].payload;
      console.log('🔍 WeeklyChart - Clicking with payload:', payload);
      onBarClick(payload);
    }
  };

  const handleBarMouseEnter = (data: any) => {
    console.log('🔍 WeeklyChart - Bar hover enter:', data);
    if (data?.date) {
      onHoverDay(data.date);
    }
  };

  const handleBarMouseLeave = () => {
    console.log('🔍 WeeklyChart - Bar hover leave');
    onHoverDay(null);
  };

  return (
    <div className="h-[330px]">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'bar' ? (
          <BarChart 
            data={weekData} 
            margin={config.margin}
            onClick={handleChartClick}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="day" {...config.xAxisProps} />
            <YAxis {...config.yAxisProps} domain={[0, Math.max(maxHours * 1.1, 0.5)]} />
            <ReferenceLine {...config.referenceLineProps} />
            <Tooltip 
              content={(props) => <WeeklyChartTooltip {...props} formatTime={formatTime} />}
              wrapperStyle={{ outline: 'none' }}
            />
            <Bar 
              dataKey="totalHours" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity cursor-pointer"
              onMouseEnter={handleBarMouseEnter}
              onMouseLeave={handleBarMouseLeave}
            />
          </BarChart>
        ) : (
          <LineChart data={weekData} margin={config.margin} onClick={handleChartClick}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="day" {...config.xAxisProps} />
            <YAxis {...config.yAxisProps} domain={[0, Math.max(maxHours * 1.1, 0.5)]} />
            <Tooltip
              content={(props) => <WeeklyChartTooltip {...props} formatTime={formatTime} />}
              wrapperStyle={{ outline: 'none' }}
            />
            <ReferenceLine {...config.referenceLineProps} />
            <Line 
              type="monotone"
              dataKey="totalHours"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "hsl(var(--accent))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;
