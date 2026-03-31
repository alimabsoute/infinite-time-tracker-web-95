
import { format } from 'date-fns';

export interface WeeklyChartTooltipProps {
  active?: boolean;
  payload?: any[];
  formatTime: (ms: number) => string;
}

export const WeeklyChartTooltip: React.FC<WeeklyChartTooltipProps> = ({ 
  active, 
  payload, 
  formatTime 
}) => {
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
};

export const getChartConfig = (averageHours: number) => ({
  margin: { top: 10, right: 10, left: 0, bottom: 20 },
  referenceLineProps: {
    y: averageHours,
    stroke: "hsl(var(--primary))",
    strokeDasharray: "3 3",
    label: { 
      value: 'Avg', 
      position: 'insideTopRight' as const,
      fill: 'hsl(var(--primary))',
      fontSize: 10
    }
  },
  xAxisProps: {
    tick: { fontSize: 12 },
    tickLine: false,
    axisLine: { stroke: 'hsl(var(--border))' }
  },
  yAxisProps: {
    tick: { fontSize: 10 },
    tickLine: false,
    axisLine: { stroke: 'hsl(var(--border))' },
    tickFormatter: (value: number) => `${value}h`
  }
});
