
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

  return (
    <div className="h-[330px]">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'bar' ? (
          <BarChart 
            data={weekData} 
            margin={config.margin}
            onClick={(data) => onBarClick(data?.activePayload?.[0]?.payload)}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--foreground), 0.05)" />
            <XAxis dataKey="day" {...config.xAxisProps} />
            <YAxis {...config.yAxisProps} />
            <ReferenceLine {...config.referenceLineProps} />
            <Tooltip 
              content={(props) => <WeeklyChartTooltip {...props} formatTime={formatTime} />}
              wrapperStyle={{ outline: 'none' }}
            />
            <Bar 
              dataKey="totalHours" 
              fill="rgba(var(--primary), 0.8)" 
              radius={[4, 4, 0, 0]}
              animationDuration={800}
              className="hover:opacity-80 transition-opacity cursor-pointer"
              onMouseOver={(data) => onHoverDay(data.date)}
              onMouseLeave={() => onHoverDay(null)}
            >
              {weekData.map((entry, index) => (
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
          <LineChart data={weekData} margin={config.margin}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--foreground), 0.05)" />
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
              stroke="rgba(var(--primary), 0.8)"
              dot={{ r: 4, fill: "rgba(var(--primary), 0.8)", stroke: "rgba(var(--background), 1)", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "rgba(var(--accent), 0.9)", stroke: "rgba(var(--background), 1)", strokeWidth: 2 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;
