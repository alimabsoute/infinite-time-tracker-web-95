
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

  // Enhanced debug logging with data validation
    weekDataLength: weekData.length,
    averageHours: averageHours.toFixed(4),
    chartType,
    selectedDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'none',
    weekData: weekData.map(d => ({
      day: d.day,
      date: format(d.date, 'yyyy-MM-dd'),
      totalHours: d.totalHours.toFixed(4),
      totalMinutes: Math.round(d.totalHours * 60),
      timers: d.timers,
      hasData: d.totalHours > 0,
      isValidDate: d.date instanceof Date && !isNaN(d.date.getTime())
    })),
    dataValidation: {
      allDatesValid: weekData.every(d => d.date instanceof Date && !isNaN(d.date.getTime())),
      allHoursNumbers: weekData.every(d => typeof d.totalHours === 'number' && !isNaN(d.totalHours)),
      hasAnyData: weekData.some(d => d.totalHours > 0),
      maxHours: Math.max(...weekData.map(d => d.totalHours), 0),
      totalWeekHours: weekData.reduce((sum, d) => sum + d.totalHours, 0)
    }
  });

  // Validate data before rendering
  const hasValidData = weekData.length > 0 && weekData.every(d => 
    d.date instanceof Date && 
    !isNaN(d.date.getTime()) && 
    typeof d.totalHours === 'number' && 
    !isNaN(d.totalHours)
  );

  if (!hasValidData) {
    console.error('WeeklyChart - Invalid data detected:', {
      weekDataLength: weekData.length,
      invalidItems: weekData.filter(d => 
        !(d.date instanceof Date) || 
        isNaN(d.date.getTime()) || 
        typeof d.totalHours !== 'number' || 
        isNaN(d.totalHours)
      )
    });
    return (
      <div className="h-[330px] flex items-center justify-center">
        <p className="text-muted-foreground">Invalid chart data</p>
      </div>
    );
  }

  const hasAnyData = weekData.some(d => d.totalHours > 0);
  const maxHours = Math.max(...weekData.map(d => d.totalHours), 0);
  
  if (!hasAnyData) {
    return (
      <div className="h-[330px] flex items-center justify-center">
        <p className="text-muted-foreground">No activity data for this week</p>
      </div>
    );
  }

  const handleChartClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload) {
      const payload = data.activePayload[0].payload;
        date: payload.date,
        day: payload.day,
        totalHours: payload.totalHours,
        timers: payload.timers
      });
      onBarClick(payload);
    }
  };

  const handleBarMouseEnter = (data: any) => {
      date: data?.date,
      day: data?.day,
      totalHours: data?.totalHours
    });
    if (data?.date) {
      onHoverDay(data.date);
    }
  };

  const handleBarMouseLeave = () => {
    onHoverDay(null);
  };

  // Calculate appropriate Y-axis domain
  const yAxisMax = Math.max(maxHours * 1.2, 0.5); // Ensure minimum scale

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
            <YAxis {...config.yAxisProps} domain={[0, yAxisMax]} />
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
            <YAxis {...config.yAxisProps} domain={[0, yAxisMax]} />
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
