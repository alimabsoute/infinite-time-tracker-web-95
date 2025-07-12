
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { TimerSessionWithTimer } from '../../../types';
import { Badge } from "@/components/ui/badge";
import { getProcessedTimerColors } from '../../../utils/timerColorProcessor';

interface InteractiveTimelineChartProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
  startDate?: Date;
  endDate?: Date;
}

const InteractiveTimelineChart: React.FC<InteractiveTimelineChartProps> = ({ 
  sessions, 
  selectedCategory,
  startDate,
  endDate 
}) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const timelineData = useMemo(() => {
    const filteredSessions = sessions.filter(session => 
      session.duration_ms && 
      session.timers &&
      session.start_time &&
      (!selectedCategory || selectedCategory === 'all' || session.timers.category === selectedCategory)
    );

    if (filteredSessions.length === 0) return [];

    // Group sessions by day
    const dayGroups: { [key: string]: TimerSessionWithTimer[] } = {};
    
    filteredSessions.forEach(session => {
      try {
        const sessionDate = parseISO(session.start_time!);
        const dayKey = format(sessionDate, 'yyyy-MM-dd');
        
        if (!dayGroups[dayKey]) {
          dayGroups[dayKey] = [];
        }
        dayGroups[dayKey].push(session);
      } catch (error) {
        console.warn('Invalid session date:', session.start_time);
      }
    });

    // Create timeline data
    return Object.entries(dayGroups)
      .map(([dayKey, daySessions]) => {
        const totalTime = daySessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
        const sessionCount = daySessions.length;
        const uniqueTimers = new Set(daySessions.map(s => s.timer_id)).size;
        
        // Get dominant category color
        const categoryTimes: { [key: string]: number } = {};
        daySessions.forEach(session => {
          const category = session.timers?.category || 'Uncategorized';
          categoryTimes[category] = (categoryTimes[category] || 0) + (session.duration_ms || 0);
        });
        
        const dominantCategory = Object.entries(categoryTimes)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Uncategorized';
        
        // Use first timer's color as representative
        const firstTimerId = daySessions[0]?.timer_id;
        const colors = firstTimerId ? getProcessedTimerColors(firstTimerId) : { primaryBorder: '#3b82f6' };
        
        return {
          date: dayKey,
          displayDate: format(parseISO(dayKey), 'MMM dd'),
          totalHours: totalTime / (1000 * 60 * 60),
          sessionCount,
          uniqueTimers,
          dominantCategory,
          color: colors.primaryBorder,
          sessions: daySessions
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [sessions, selectedCategory]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm p-4 border border-border rounded-lg shadow-lg">
          <p className="font-semibold text-lg text-foreground mb-2">{format(parseISO(data.date), 'EEEE, MMM dd')}</p>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Total Time:</span> {data.totalHours.toFixed(1)} hours</p>
            <p><span className="font-medium">Sessions:</span> {data.sessionCount}</p>
            <p><span className="font-medium">Unique Timers:</span> {data.uniqueTimers}</p>
            <p><span className="font-medium">Primary Category:</span> {data.dominantCategory}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any) => {
    setSelectedDay(selectedDay === data.date ? null : data.date);
  };

  if (timelineData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No timeline data available</p>
        </div>
      </div>
    );
  }

  const selectedDayData = selectedDay ? timelineData.find(d => d.date === selectedDay) : null;

  return (
    <div className="h-full w-full border rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="h-full flex flex-col">
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={timelineData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="displayDate" 
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="totalHours" 
                radius={[4, 4, 0, 0]}
                onClick={handleBarClick}
                style={{ cursor: 'pointer' }}
              >
                {timelineData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    fillOpacity={selectedDay === entry.date ? 1 : 0.7}
                    stroke={selectedDay === entry.date ? entry.color : 'none'}
                    strokeWidth={selectedDay === entry.date ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Selected Day Details - Only show if there's space */}
        {selectedDayData && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg border flex-shrink-0">
            <h4 className="font-semibold mb-2">
              {format(parseISO(selectedDayData.date), 'EEEE, MMMM dd, yyyy')}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{selectedDayData.totalHours.toFixed(1)}h</div>
                <div className="text-xs text-muted-foreground">Total Time</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-secondary">{selectedDayData.sessionCount}</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-accent">{selectedDayData.uniqueTimers}</div>
                <div className="text-xs text-muted-foreground">Timers</div>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  {selectedDayData.dominantCategory}
                </Badge>
              </div>
            </div>
            
            {/* Session List */}
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedDayData.sessions.slice(0, 5).map((session, index) => (
                <div key={session.id} className="flex justify-between items-center text-xs">
                  <span className="font-medium truncate">
                    {session.timers?.name || 'Unknown Timer'}
                  </span>
                  <span className="text-muted-foreground">
                    {((session.duration_ms || 0) / (1000 * 60)).toFixed(0)}min
                  </span>
                </div>
              ))}
              {selectedDayData.sessions.length > 5 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{selectedDayData.sessions.length - 5} more sessions
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveTimelineChart;
