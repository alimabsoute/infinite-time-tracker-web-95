
import React from 'react';
import { TimerSessionWithTimer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { format, parseISO, startOfDay, eachDayOfInterval, subDays } from 'date-fns';

interface PerformanceHeatmapProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
}

const PerformanceHeatmap: React.FC<PerformanceHeatmapProps> = ({ sessions, selectedCategory }) => {
  const generateHeatmapData = () => {
    const endDate = new Date();
    const startDate = subDays(endDate, 83); // 12 weeks
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const filteredSessions = sessions.filter(session => 
      session.duration_ms && 
      session.timers &&
      (!selectedCategory || selectedCategory === 'all' || session.timers.category === selectedCategory)
    );

    const dailyData = days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const daySessions = filteredSessions.filter(session => {
        const sessionDate = parseISO(session.start_time);
        return sessionDate >= dayStart && sessionDate < dayEnd;
      });

      const totalTime = daySessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0);
      
      return {
        date: day,
        value: totalTime / (1000 * 60 * 60), // Convert to hours
        sessions: daySessions.length,
        dayOfWeek: day.getDay(),
        weekIndex: Math.floor((day.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      };
    });

    const maxValue = Math.max(...dailyData.map(d => d.value), 1);
    
    return dailyData.map(day => ({
      ...day,
      intensity: Math.min(day.value / maxValue, 1)
    }));
  };

  const data = generateHeatmapData();
  const weeks = Math.max(...data.map(d => d.weekIndex)) + 1;

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'hsl(var(--muted))';
    if (intensity < 0.25) return 'hsl(142, 70%, 85%)';
    if (intensity < 0.5) return 'hsl(142, 70%, 70%)';
    if (intensity < 0.75) return 'hsl(142, 70%, 55%)';
    return 'hsl(142, 70%, 40%)';
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle className="text-lg">Activity Heatmap</CardTitle>
        <p className="text-sm text-muted-foreground">Last 12 weeks of activity</p>
      </CardHeader>
      <CardContent className="overflow-auto">
        <div className="inline-block">
          <div className="flex gap-1 mb-2">
            <div className="w-6"></div>
            {Array.from({ length: weeks }, (_, i) => {
              const weekStart = new Date(data[0].date.getTime() + i * 7 * 24 * 60 * 60 * 1000);
              return (
                <div key={i} className="w-3 text-xs text-center text-muted-foreground">
                  {i % 4 === 0 ? format(weekStart, 'MMM') : ''}
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-1">
            <div className="flex flex-col gap-1">
              {dayLabels.map((day, i) => (
                <div key={day} className="w-6 h-3 text-xs flex items-center text-muted-foreground">
                  {i % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>
            
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}>
              {Array.from({ length: weeks }, (_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const dayData = data.find(d => 
                      d.weekIndex === weekIndex && d.dayOfWeek === dayIndex
                    );
                    
                    if (!dayData) return <div key={dayIndex} className="w-3 h-3" />;
                    
                    return (
                      <div
                        key={dayIndex}
                        className="w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                        style={{ backgroundColor: getIntensityColor(dayData.intensity) }}
                        title={`${format(dayData.date, 'MMM d, yyyy')}: ${dayData.value.toFixed(1)}h (${dayData.sessions} sessions)`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 0.25, 0.5, 0.75, 1].map(intensity => (
                <div
                  key={intensity}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: getIntensityColor(intensity) }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceHeatmap;
