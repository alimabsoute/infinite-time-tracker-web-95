
import React from 'react';
import { isSameDay } from 'date-fns';
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

  // Debug logging
  console.log('WeeklyChart - weekData:', weekData);
  console.log('WeeklyChart - averageHours:', averageHours);
  console.log('WeeklyChart - chartType:', chartType);

  return (
    <div className="h-[330px]">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'bar' ? (
          <BarChart 
            data={weekData} 
            margin={config.margin}
            onClick={(data) => {
              console.log('Bar clicked:', data);
              onBarClick(data?.activePayload?.[0]?.payload);
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="day" {...config.xAxisProps} />
            <YAxis {...config.yAxisProps} />
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
              onMouseEnter={(data) => {
                console.log('Bar hover enter:', data);
                onHoverDay(data.date);
              }}
              onMouseLeave={() => {
                console.log('Bar hover leave');
                onHoverDay(null);
              }}
            />
          </BarChart>
        ) : (
          <LineChart data={weekData} margin={config.margin}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="day" {...config.xAxisProps} />
            <YAxis {...config.yAxisProps} />
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
