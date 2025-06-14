
import React from 'react';
import { Timer } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Play, Pause, Calendar } from 'lucide-react';

interface ReportsSummaryProps {
  timers: Timer[];
}

const ReportsSummary: React.FC<ReportsSummaryProps> = ({ timers }) => {
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const totalTime = timers.reduce((sum, timer) => sum + timer.elapsedTime, 0);
  const runningTimers = timers.filter(timer => timer.isRunning).length;
  const stoppedTimers = timers.filter(timer => !timer.isRunning).length;
  const categories = new Set(timers.map(timer => timer.category || 'Uncategorized')).size;

  // Calculate average time per timer
  const averageTime = timers.length > 0 ? totalTime / timers.length : 0;

  // Find most used category
  const categoryCount = timers.reduce((acc, timer) => {
    const category = timer.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostUsedCategory = Object.entries(categoryCount).reduce(
    (max, [category, count]) => count > max.count ? { category, count } : max,
    { category: 'None', count: 0 }
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTime(totalTime)}</div>
          <p className="text-xs text-muted-foreground">
            Across {timers.length} timer{timers.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Timers</CardTitle>
          <Play className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{runningTimers}</div>
          <p className="text-xs text-muted-foreground">
            {stoppedTimers} stopped
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Time</CardTitle>
          <Pause className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTime(averageTime)}</div>
          <p className="text-xs text-muted-foreground">
            Per timer
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{categories}</div>
          <p className="text-xs text-muted-foreground">
            Top: {mostUsedCategory.category}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsSummary;
