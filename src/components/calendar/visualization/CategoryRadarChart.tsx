
import React, { useMemo, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { TimerSessionWithTimer } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryRadarChartProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
}

const CategoryRadarChart: React.FC<CategoryRadarChartProps> = ({ sessions, selectedCategory }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const radarData = useMemo(() => {
    const filteredSessions = sessions.filter(session => 
      session.duration_ms && 
      session.timers &&
      (!selectedCategory || selectedCategory === 'all' || session.timers.category === selectedCategory)
    );

    const categoryStats: { [key: string]: { time: number; sessions: number; efficiency: number } } = {};
    
    filteredSessions.forEach(session => {
      const category = session.timers?.category || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = { time: 0, sessions: 0, efficiency: 0 };
      }
      categoryStats[category].time += session.duration_ms || 0;
      categoryStats[category].sessions += 1;
    });

    // Calculate efficiency (average session time)
    Object.keys(categoryStats).forEach(category => {
      const avgSessionTime = categoryStats[category].time / categoryStats[category].sessions;
      categoryStats[category].efficiency = Math.min(100, (avgSessionTime / (1000 * 60 * 60)) * 20); // Scale to 0-100
    });

    if (Object.keys(categoryStats).length === 0) return [];

    const maxTime = Math.max(...Object.values(categoryStats).map(s => s.time));
    const maxSessions = Math.max(...Object.values(categoryStats).map(s => s.sessions));

    return Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      time: (stats.time / maxTime) * 100,
      sessions: (stats.sessions / maxSessions) * 100,
      efficiency: stats.efficiency,
      rawTime: stats.time,
      rawSessions: stats.sessions,
      avgSessionMinutes: (stats.time / stats.sessions) / (1000 * 60)
    }));
  }, [sessions, selectedCategory]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm p-4 border border-border rounded-lg shadow-lg">
          <p className="font-semibold text-lg text-foreground mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Total Time:</span> {(data.rawTime / (1000 * 60 * 60)).toFixed(1)} hours</p>
            <p><span className="font-medium">Sessions:</span> {data.rawSessions}</p>
            <p><span className="font-medium">Avg Session:</span> {data.avgSessionMinutes.toFixed(0)} minutes</p>
            <p><span className="font-medium">Efficiency Score:</span> {data.efficiency.toFixed(0)}/100</p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (radarData.length === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No category data available for radar visualization</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Category Performance Radar</CardTitle>
        <p className="text-sm text-muted-foreground">Multi-dimensional category analysis</p>
      </CardHeader>
      <CardContent className="h-full">
        <div className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="category" 
                tick={{ 
                  fontSize: 12, 
                  fill: 'hsl(var(--foreground))',
                  cursor: 'pointer'
                }}
                className="interactive-radar-labels"
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Radar
                name="Time"
                dataKey="time"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Sessions"
                dataKey="sessions"
                stroke="hsl(var(--secondary))"
                fill="hsl(var(--secondary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="Efficiency"
                dataKey="efficiency"
                stroke="hsl(var(--accent))"
                fill="hsl(var(--accent))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span>Time Volume</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-secondary rounded-full"></div>
            <span>Session Count</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <span>Efficiency</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryRadarChart;
