
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Timer } from "../../types";

interface CategoryDistributionItem {
  name: string;
  value: number;
}

interface ActivityVisualizationProps {
  categoryDistribution: CategoryDistributionItem[];
  filteredTimers: Timer[];
  formatTime: (ms: number) => string;
}

const ActivityVisualization: React.FC<ActivityVisualizationProps> = ({
  categoryDistribution,
  filteredTimers,
  formatTime
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Category distribution */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-lg">Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryDistribution.length > 0 ? (
            <div className="space-y-3">
              {categoryDistribution.map(item => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="font-mono">
                      {formatTime(item.value * 3600000)}
                    </span>
                  </div>
                  <Progress 
                    value={
                      (item.value / categoryDistribution.reduce((sum, i) => sum + i.value, 0)) * 100
                    } 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No activity recorded for selected date.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Activity timeline */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] relative">
            {filteredTimers.length > 0 ? (
              <div className="grid grid-cols-12 h-full gap-1">
                {Array.from({ length: 12 }).map((_, i) => {
                  const hour = i * 2; // 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22
                  const nextHour = hour + 2;
                  
                  // Calculate activity in this time range
                  const activityInRange = filteredTimers.filter(timer => {
                    const date = new Date(timer.createdAt);
                    const timerHour = date.getHours();
                    return timerHour >= hour && timerHour < nextHour;
                  });
                  
                  const totalTime = activityInRange.reduce((sum, timer) => sum + timer.elapsedTime, 0);
                  const maxTime = 7200000; // 2 hours in ms
                  const heightPercentage = Math.min(100, (totalTime / maxTime) * 100);
                  
                  return (
                    <div key={hour} className="flex flex-col h-full relative">
                      <div className="mt-auto flex flex-col items-center">
                        <div 
                          className="w-full bg-primary/80 rounded-t-sm"
                          style={{ height: `${heightPercentage}%` }}
                        ></div>
                        <span className="text-[10px] mt-1">{hour}</span>
                      </div>
                      {i % 2 === 0 && (
                        <div className="absolute -bottom-6 left-0 text-[10px] text-muted-foreground whitespace-nowrap">
                          {hour}:00
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No activity data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityVisualization;
