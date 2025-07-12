
import React, { useState, useMemo } from 'react';
import { TimerSessionWithTimer } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryRadarChartProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
}

const CategoryRadarChart: React.FC<CategoryRadarChartProps> = ({ sessions, selectedCategory }) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const radarData = useMemo(() => {
    const filteredSessions = sessions.filter(session => 
      session.duration_ms && 
      session.timers &&
      (!selectedCategory || selectedCategory === 'all' || session.timers.category === selectedCategory)
    );

    const categoryStats: { [key: string]: { time: number; sessions: number; avgSession: number } } = {};
    
    filteredSessions.forEach(session => {
      const category = session.timers?.category || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = { time: 0, sessions: 0, avgSession: 0 };
      }
      categoryStats[category].time += session.duration_ms || 0;
      categoryStats[category].sessions += 1;
    });

    // Calculate average session time and normalize scores
    const maxTime = Math.max(...Object.values(categoryStats).map(s => s.time), 1);
    const maxSessions = Math.max(...Object.values(categoryStats).map(s => s.sessions), 1);

    return Object.entries(categoryStats).map(([category, stats], index) => {
      const avgSession = stats.sessions > 0 ? stats.time / stats.sessions : 0;
      const maxAvgSession = Math.max(...Object.values(categoryStats).map(s => 
        s.sessions > 0 ? s.time / s.sessions : 0
      ), 1);

      return {
        category,
        timeScore: (stats.time / maxTime) * 100,
        sessionScore: (stats.sessions / maxSessions) * 100,
        avgSessionScore: (avgSession / maxAvgSession) * 100,
        totalTime: stats.time / (1000 * 60 * 60), // hours
        sessionCount: stats.sessions,
        avgSessionTime: avgSession / (1000 * 60), // minutes
        angle: (index / Object.keys(categoryStats).length) * 360,
        color: `hsl(${(index * 137.5) % 360}, 65%, 60%)`
      };
    });
  }, [sessions, selectedCategory]);

  const centerX = 120;
  const centerY = 120;
  const radius = 80;

  const getPointCoordinates = (angle: number, value: number) => {
    const radian = (angle - 90) * (Math.PI / 180);
    const r = (value / 100) * radius;
    return {
      x: centerX + r * Math.cos(radian),
      y: centerY + r * Math.sin(radian)
    };
  };

  const createPolygonPoints = (metric: 'timeScore' | 'sessionScore' | 'avgSessionScore') => {
    return radarData.map(item => {
      const point = getPointCoordinates(item.angle, item[metric]);
      return `${point.x},${point.y}`;
    }).join(' ');
  };

  if (radarData.length === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No data available for radar chart</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle className="text-lg">Category Performance Radar</CardTitle>
        <p className="text-sm text-muted-foreground">Interactive radar showing time, sessions, and efficiency</p>
      </CardHeader>
      <CardContent className="flex items-center h-full">
        <div className="flex-1">
          <svg width="240" height="240" viewBox="0 0 240 240">
            {/* Grid circles */}
            {[25, 50, 75, 100].map(percent => (
              <circle
                key={percent}
                cx={centerX}
                cy={centerY}
                r={(percent / 100) * radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="1"
                opacity="0.3"
              />
            ))}
            
            {/* Grid lines */}
            {radarData.map((item, index) => {
              const point = getPointCoordinates(item.angle, 100);
              return (
                <line
                  key={index}
                  x1={centerX}
                  y1={centerY}
                  x2={point.x}
                  y2={point.y}
                  stroke="hsl(var(--muted))"
                  strokeWidth="1"
                  opacity="0.3"
                />
              );
            })}
            
            {/* Data polygons */}
            <polygon
              points={createPolygonPoints('timeScore')}
              fill="hsl(210, 70%, 60%)"
              fillOpacity="0.2"
              stroke="hsl(210, 70%, 60%)"
              strokeWidth="2"
            />
            <polygon
              points={createPolygonPoints('sessionScore')}
              fill="hsl(140, 70%, 60%)"
              fillOpacity="0.2"
              stroke="hsl(140, 70%, 60%)"
              strokeWidth="2"
            />
            <polygon
              points={createPolygonPoints('avgSessionScore')}
              fill="hsl(45, 70%, 60%)"
              fillOpacity="0.2"
              stroke="hsl(45, 70%, 60%)"
              strokeWidth="2"
            />
            
            {/* Data points */}
            {radarData.map((item, index) => {
              const timePoint = getPointCoordinates(item.angle, item.timeScore);
              const sessionPoint = getPointCoordinates(item.angle, item.sessionScore);
              const avgPoint = getPointCoordinates(item.angle, item.avgSessionScore);
              
              return (
                <g key={index}>
                  <circle cx={timePoint.x} cy={timePoint.y} r="4" fill="hsl(210, 70%, 60%)" />
                  <circle cx={sessionPoint.x} cy={sessionPoint.y} r="4" fill="hsl(140, 70%, 60%)" />
                  <circle cx={avgPoint.x} cy={avgPoint.y} r="4" fill="hsl(45, 70%, 60%)" />
                  
                  {/* Category labels */}
                  <text
                    x={getPointCoordinates(item.angle, 110).x}
                    y={getPointCoordinates(item.angle, 110).y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-medium fill-current cursor-pointer"
                    onClick={() => setSelectedSegment(selectedSegment === item.category ? null : item.category)}
                    onMouseEnter={() => setHoveredSegment(item.category)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  >
                    {item.category}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        
        <div className="flex-1 space-y-4 ml-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span className="text-sm">Total Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-sm">Session Count</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500"></div>
              <span className="text-sm">Avg Session</span>
            </div>
          </div>
          
          {(hoveredSegment || selectedSegment) && (
            <div className="p-3 rounded-lg bg-muted/30">
              {radarData
                .filter(item => item.category === (selectedSegment || hoveredSegment))
                .map(item => (
                  <div key={item.category}>
                    <h4 className="font-medium">{item.category}</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <div>Total: {item.totalTime.toFixed(1)}h</div>
                      <div>Sessions: {item.sessionCount}</div>
                      <div>Avg: {item.avgSessionTime.toFixed(0)}m</div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryRadarChart;
