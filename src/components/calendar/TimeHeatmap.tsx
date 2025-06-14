
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatMapGrid } from "@/components/ui/heat-map";
import { Timer } from "../../types";
import { format, startOfWeek, addDays } from 'date-fns';

interface TimeHeatmapProps {
  timers: Timer[];
  formatTime: (ms: number) => string;
}

const TimeHeatmap: React.FC<TimeHeatmapProps> = ({ timers, formatTime }) => {
  // Generate heatmap data for the last 7 days and 24 hours
  const generateHeatmapData = () => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    
    const data: { day: number; hour: number; value: number }[] = [];
    
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const currentDate = addDays(weekStart, day);
        const startTime = new Date(currentDate);
        startTime.setHours(hour, 0, 0, 0);
        const endTime = new Date(currentDate);
        endTime.setHours(hour, 59, 59, 999);
        
        // Find timers in this hour slot
        const hourTimers = timers.filter(timer => {
          const timerDate = new Date(timer.createdAt);
          return timerDate >= startTime && timerDate <= endTime;
        });
        
        const totalTime = hourTimers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
        data.push({ day, hour, value: totalTime });
      }
    }
    
    return data;
  };

  const heatmapData = generateHeatmapData();
  const maxValue = Math.max(...heatmapData.map(d => d.value), 1);
  
  // Generate labels
  const dayLabels = Array.from({ length: 7 }, (_, i) => 
    format(addDays(startOfWeek(new Date()), i), 'EEE')
  );
  
  const hourLabels = Array.from({ length: 24 }, (_, i) => 
    i % 2 === 0 ? `${i}:00` : ''
  );

  const cellStyle = (hour: number, day: number, value: number) => {
    const intensity = value / maxValue;
    const opacity = Math.max(0.1, intensity);
    
    return {
      backgroundColor: value > 0 ? `hsl(var(--primary))` : 'hsl(var(--muted))',
      opacity: value > 0 ? opacity : 0.1,
      border: '1px solid hsl(var(--border))',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };
  };

  const cellRender = (hour: number, day: number, value: number) => {
    if (value === 0) return '';
    return (
      <div 
        className="w-full h-full flex items-center justify-center text-[8px] font-mono text-white"
        title={`${dayLabels[day]} ${hour}:00 - ${formatTime(value)}`}
      >
        {value > 3600000 ? Math.round(value / 3600000) + 'h' : ''}
      </div>
    );
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="text-lg">Activity Heatmap</CardTitle>
        <p className="text-sm text-muted-foreground">
          Your activity patterns across the week
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <HeatMapGrid
            data={heatmapData}
            xLabels={hourLabels}
            yLabels={dayLabels}
            cellHeight="24px"
            cellWidth="16px"
            cellRadius={2}
            cellStyle={cellStyle}
            cellRender={cellRender}
          />
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span>Less active</span>
          <div className="flex gap-1">
            {[0, 0.25, 0.5, 0.75, 1].map(intensity => (
              <div
                key={intensity}
                className="w-3 h-3 rounded-sm border border-border"
                style={{
                  backgroundColor: intensity > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                  opacity: Math.max(0.1, intensity)
                }}
              />
            ))}
          </div>
          <span>More active</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeHeatmap;
