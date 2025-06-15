
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeatMapGrid } from "@/components/ui/heat-map";
import { TimerSessionWithTimer } from "../../types";
import { format, startOfWeek, addDays, parseISO } from 'date-fns';

interface TimeHeatmapProps {
  sessions: TimerSessionWithTimer[];
  formatTime: (ms: number) => string;
}

const TimeHeatmap: React.FC<TimeHeatmapProps> = ({ sessions, formatTime }) => {
  const basisDate = React.useMemo(() => {
    if (sessions.length === 0) return new Date();
    const lastSessionDate = Math.max(...sessions.map(s => parseISO(s.start_time).getTime()));
    return new Date(lastSessionDate);
  }, [sessions]);

  const weekStart = React.useMemo(() => startOfWeek(basisDate), [basisDate]);

  const heatmapData = React.useMemo(() => {
    const data = Array.from({ length: 7 * 24 }, (_, i) => ({
      day: Math.floor(i / 24),
      hour: i % 24,
      value: 0
    }));

    sessions.forEach(session => {
      if (!session.duration_ms) return;

      let sessionStart = parseISO(session.start_time);
      let remainingDuration = session.duration_ms;

      if (sessionStart >= addDays(weekStart, 7) || addDays(sessionStart, session.duration_ms / 1000 / 60 / 60) < weekStart) {
        return;
      }

      while (remainingDuration > 0 && sessionStart < addDays(weekStart, 7)) {
        if(sessionStart < weekStart) {
            remainingDuration -= (weekStart.getTime() - sessionStart.getTime());
            sessionStart = new Date(weekStart);
            if(remainingDuration <= 0) continue;
        }

        const dayIndex = (sessionStart.getDay() - weekStart.getDay() + 7) % 7;
        const hourIndex = sessionStart.getHours();
        
        const dataIndex = dayIndex * 24 + hourIndex;

        const startOfNextHour = new Date(sessionStart);
        startOfNextHour.setMinutes(0, 0, 0);
        startOfNextHour.setHours(startOfNextHour.getHours() + 1);

        const timeInHour = Math.min(
          remainingDuration,
          startOfNextHour.getTime() - sessionStart.getTime()
        );
        
        if (data[dataIndex]) {
          data[dataIndex].value += timeInHour;
        }

        remainingDuration -= timeInHour;
        sessionStart = new Date(sessionStart.getTime() + timeInHour);
      }
    });

    return data;
  }, [sessions, weekStart]);

  const maxValue = React.useMemo(() => Math.max(...heatmapData.map(d => d.value), 1), [heatmapData]);
  
  const dayLabels = React.useMemo(() => Array.from({ length: 7 }, (_, i) => 
    format(addDays(weekStart, i), 'EEE')
  ), [weekStart]);
  
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
    if (value === 0) return null;
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
