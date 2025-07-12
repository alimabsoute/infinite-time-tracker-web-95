
import React, { useState, useMemo } from 'react';
import { TimerSessionWithTimer } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, startOfDay, eachDayOfInterval, subDays } from 'date-fns';

interface InteractiveTimelineChartProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
}

const InteractiveTimelineChart: React.FC<InteractiveTimelineChartProps> = ({ sessions, selectedCategory }) => {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [hoveredSession, setHoveredSession] = useState<any | null>(null);

  const timelineData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 30); // Last 30 days
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const filteredSessions = sessions.filter(session => 
      session.duration_ms && 
      session.timers &&
      (!selectedCategory || selectedCategory === 'all' || session.timers.category === selectedCategory)
    );

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const daySessions = filteredSessions.filter(session => {
        const sessionDate = parseISO(session.start_time);
        return sessionDate >= dayStart && sessionDate < dayEnd;
      });

      const totalTime = daySessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
      const categories = [...new Set(daySessions.map(s => s.timers?.category || 'Uncategorized'))];
      
      return {
        date: day,
        sessions: daySessions,
        totalTime: totalTime / (1000 * 60 * 60), // Convert to hours
        categories,
        sessionCount: daySessions.length
      };
    }).filter(day => day.sessionCount > 0);
  }, [sessions, selectedCategory]);

  const maxTime = Math.max(...timelineData.map(d => d.totalTime), 1);

  const getColorForCategory = (category: string) => {
    const colors = {
      'Work': 'hsl(210, 70%, 60%)',
      'Personal': 'hsl(140, 70%, 60%)',
      'Study': 'hsl(45, 70%, 60%)',
      'Exercise': 'hsl(0, 70%, 60%)',
      'Health': 'hsl(280, 70%, 60%)',
      'Uncategorized': 'hsl(0, 0%, 60%)'
    };
    return colors[category as keyof typeof colors] || 'hsl(200, 70%, 60%)';
  };

  if (timelineData.length === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No data available for interactive timeline</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle className="text-lg">Interactive Activity Timeline</CardTitle>
        <p className="text-sm text-muted-foreground">Click on bars to see details • Hover for quick info</p>
      </CardHeader>
      <CardContent className="h-full">
        <div className="h-full flex">
          <div className="flex-1 overflow-x-auto">
            <div className="flex items-end h-64 gap-1 min-w-max px-4">
              {timelineData.map((day, index) => (
                <div 
                  key={index}
                  className="relative flex flex-col items-center cursor-pointer group"
                  onClick={() => setSelectedDay(selectedDay?.getTime() === day.date.getTime() ? null : day.date)}
                  onMouseEnter={() => setHoveredSession(day)}
                  onMouseLeave={() => setHoveredSession(null)}
                >
                  <div className="relative">
                    <div
                      className={`w-6 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all duration-200 hover:scale-110 ${
                        selectedDay?.getTime() === day.date.getTime() ? 'ring-2 ring-blue-400 scale-110' : ''
                      }`}
                      style={{ 
                        height: `${Math.max(4, (day.totalTime / maxTime) * 200)}px`,
                        background: day.categories.length === 1 
                          ? getColorForCategory(day.categories[0])
                          : 'linear-gradient(to top, hsl(210, 70%, 60%), hsl(140, 70%, 60%))'
                      }}
                    />
                    
                    {hoveredSession?.date.getTime() === day.date.getTime() && (
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg p-2 text-xs min-w-32 z-10 shadow-lg">
                        <div className="font-medium">{format(day.date, 'MMM d')}</div>
                        <div className="text-muted-foreground">{day.totalTime.toFixed(1)}h total</div>
                        <div className="text-muted-foreground">{day.sessionCount} sessions</div>
                        <div className="mt-1">
                          {day.categories.map(cat => (
                            <div key={cat} className="text-xs" style={{ color: getColorForCategory(cat) }}>
                              {cat}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-1 transform -rotate-45 origin-left">
                    {format(day.date, 'M/d')}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {selectedDay && (
            <div className="w-64 pl-4 border-l">
              <div className="h-full overflow-y-auto">
                <h4 className="font-medium mb-3">{format(selectedDay, 'MMMM d, yyyy')}</h4>
                {timelineData
                  .find(d => d.date.getTime() === selectedDay.getTime())
                  ?.sessions.map((session, idx) => (
                    <div key={idx} className="mb-2 p-2 rounded bg-muted/30">
                      <div className="font-medium text-sm">{session.timers?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {((session.duration_ms || 0) / (1000 * 60)).toFixed(0)} minutes
                      </div>
                      <div 
                        className="text-xs mt-1"
                        style={{ color: getColorForCategory(session.timers?.category || 'Uncategorized') }}
                      >
                        {session.timers?.category || 'Uncategorized'}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveTimelineChart;
