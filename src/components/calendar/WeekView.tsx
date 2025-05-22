
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface WeekViewProps {
  weekData: {
    date: Date;
    day: string;
    totalHours: number;
    timers: number;
  }[];
  formatTime: (ms: number) => string;
}

const WeekView: React.FC<WeekViewProps> = ({ weekData, formatTime }) => {
  return (
    <Card className="glass-effect mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Weekly Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover text-popover-foreground border border-border p-2 rounded-md shadow-md">
                        <p className="font-medium">{format(data.date, 'MMM d')}</p>
                        <p className="text-sm">
                          {formatTime(data.totalHours * 3600000)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {data.timers} {data.timers === 1 ? 'timer' : 'timers'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="totalHours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekView;
