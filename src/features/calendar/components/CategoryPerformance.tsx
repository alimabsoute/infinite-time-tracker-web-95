
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Progress } from "@shared/components/ui/progress";
import { Badge } from "@shared/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Timer } from "../../types";
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface CategoryPerformanceProps {
  timers: Timer[];
  formatTime: (ms: number) => string;
}

const CategoryPerformance: React.FC<CategoryPerformanceProps> = ({ timers, formatTime }) => {
  // Calculate category data
  const categoryData = React.useMemo(() => {
    const categoryMap = new Map<string, { 
      time: number; 
      sessions: number; 
      avgSession: number;
      deadlines: number;
      completed: number;
    }>();
    
    timers.forEach(timer => {
      const category = timer.category || 'Uncategorized';
      const existing = categoryMap.get(category) || { 
        time: 0, 
        sessions: 0, 
        avgSession: 0,
        deadlines: 0,
        completed: 0
      };
      
      existing.time += timer.elapsedTime;
      existing.sessions += 1;
      if (timer.deadline) existing.deadlines += 1;
      if (timer.elapsedTime > 300000) existing.completed += 1; // >5min = completed
      
      categoryMap.set(category, existing);
    });
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      time: data.time,
      timeHours: data.time / 3600000,
      sessions: data.sessions,
      avgSession: data.sessions > 0 ? data.time / data.sessions : 0,
      avgSessionHours: data.sessions > 0 ? (data.time / data.sessions) / 3600000 : 0,
      deadlines: data.deadlines,
      completed: data.completed,
      completionRate: data.sessions > 0 ? (data.completed / data.sessions) * 100 : 0
    })).sort((a, b) => b.time - a.time);
  }, [timers]);

  const totalTime = categoryData.reduce((sum, cat) => sum + cat.time, 0);
  
  // Colors for pie chart
  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(217, 91%, 60%)',
    'hsl(142, 76%, 36%)',
    'hsl(38, 92%, 50%)',
    'hsl(343, 81%, 58%)',
    'hsl(260, 84%, 60%)'
  ];

  const pieData = categoryData.map((cat, index) => ({
    ...cat,
    percentage: totalTime > 0 ? (cat.time / totalTime) * 100 : 0,
    fill: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover text-popover-foreground border border-border p-3 rounded-md shadow-md">
          <p className="font-medium">{data.category}</p>
          <div className="space-y-1 mt-2 text-sm">
            <p>Time: {formatTime(data.time)}</p>
            <p>Sessions: {data.sessions}</p>
            <p>Avg Session: {formatTime(data.avgSession)}</p>
            <p>Completion: {data.completionRate.toFixed(1)}%</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover text-popover-foreground border border-border p-3 rounded-md shadow-md">
          <p className="font-medium">{data.category}</p>
          <div className="space-y-1 mt-2 text-sm">
            <p>Time: {formatTime(data.time)}</p>
            <p>Percentage: {data.percentage.toFixed(1)}%</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Category Distribution Pie Chart */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Category Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="timeHours"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium mb-3">Categories</h4>
              {categoryData.slice(0, 6).map((cat, index) => (
                <div key={cat.category} className="flex items-center justify-between p-2 rounded">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium">{cat.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono">{formatTime(cat.time)}</div>
                    <div className="text-xs text-muted-foreground">
                      {cat.sessions} sessions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Performance Metrics */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Category Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `${value}h`}
                />
                <YAxis 
                  type="category"
                  dataKey="category"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="timeHours" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Detailed Metrics Table */}
          <div className="space-y-3">
            <h4 className="font-medium">Performance Details</h4>
            {categoryData.map((cat, _index) => (
              <div key={cat.category} className="grid grid-cols-5 gap-4 items-center p-3 bg-muted/30 rounded">
                <div>
                  <div className="font-medium text-sm">{cat.category}</div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {cat.sessions} sessions
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Time</div>
                  <div className="font-mono text-sm">{formatTime(cat.time)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Avg Session</div>
                  <div className="font-mono text-sm">{formatTime(cat.avgSession)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Completion</div>
                  <div className="flex items-center gap-2">
                    <Progress value={cat.completionRate} className="h-2 flex-1" />
                    <span className="text-xs">{cat.completionRate.toFixed(0)}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Deadlines</div>
                  <Badge variant={cat.deadlines > 0 ? "default" : "secondary"}>
                    {cat.deadlines}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryPerformance;
