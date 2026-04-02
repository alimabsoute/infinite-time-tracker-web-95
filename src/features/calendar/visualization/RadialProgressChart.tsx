
import React from 'react';
import { TimerSessionWithTimer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";

interface RadialProgressChartProps {
  sessions: TimerSessionWithTimer[];
  selectedCategory?: string;
}

const RadialProgressChart: React.FC<RadialProgressChartProps> = ({ sessions, selectedCategory }) => {
  const processData = () => {
    const filteredSessions = sessions.filter(session => 
      session.duration_ms && 
      session.timers &&
      (!selectedCategory || selectedCategory === 'all' || session.timers.category === selectedCategory)
    );

    // Group by category
    const categoryData: { [key: string]: { total: number; sessions: number } } = {};
    filteredSessions.forEach(session => {
      const category = session.timers?.category || 'Uncategorized';
      if (!categoryData[category]) {
        categoryData[category] = { total: 0, sessions: 0 };
      }
      categoryData[category].total += session.duration_ms || 0;
      categoryData[category].sessions += 1;
    });

    const maxTotal = Math.max(...Object.values(categoryData).map(d => d.total));

    return Object.entries(categoryData).map(([category, data], index) => ({
      category,
      percentage: (data.total / maxTotal) * 100,
      hours: (data.total / (1000 * 60 * 60)).toFixed(1),
      sessions: data.sessions,
      color: `hsl(${(index * 60) % 360}, 65%, 60%)`
    }));
  };

  const data = processData();

  const RadialBar = ({ item, index }: { item: any; index: number }) => {
    const radius = 80 - (index * 15);
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;

    return (
      <g key={item.category}>
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          opacity="0.3"
        />
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke={item.color}
          strokeWidth="12"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
          transform="rotate(-90 120 120)"
          className="transition-all duration-1000 ease-out"
        >
          <animate
            attributeName="stroke-dasharray"
            from={`0 ${circumference}`}
            to={strokeDasharray}
            dur="1.5s"
            fill="freeze"
          />
        </circle>
        <text
          x="120"
          y={120 - radius + 5}
          textAnchor="middle"
          className="text-xs font-medium fill-current"
        >
          {item.category}
        </text>
      </g>
    );
  };

  if (data.length === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No data available for radial progress chart</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle className="text-lg">Category Performance</CardTitle>
        <p className="text-sm text-muted-foreground">Radial progress by category</p>
      </CardHeader>
      <CardContent className="flex items-center justify-between h-full">
        <div className="flex-1">
          <svg width="240" height="240" viewBox="0 0 240 240">
            {data.map((item, index) => (
              <RadialBar key={item.category} item={item} index={index} />
            ))}
          </svg>
        </div>
        
        <div className="flex-1 space-y-3 ml-6">
          {data.map((item) => (
            <div key={item.category} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <p className="font-medium">{item.category}</p>
                  <p className="text-sm text-muted-foreground">{item.sessions} sessions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{item.hours}h</p>
                <p className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RadialProgressChart;
