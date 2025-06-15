
import React from 'react';
import { TimerReportData } from '../../hooks/useTimerReports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Play, Pause, Calendar, Trash2, Crown } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import PremiumFeatureGate from '../premium/PremiumFeatureGate';
import PremiumBadge from '../premium/PremiumBadge';

interface ReportsSummaryProps {
  reportData: TimerReportData[];
}

const ReportsSummary: React.FC<ReportsSummaryProps> = ({ reportData }) => {
  const { subscribed } = useSubscription();

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const totalTime = reportData.reduce((sum, timer) => sum + timer.totalTimeMs, 0);
  const runningTimers = reportData.filter(timer => timer.status === 'Running').length;
  const stoppedTimers = reportData.filter(timer => timer.status === 'Stopped').length;
  const deletedTimers = reportData.filter(timer => timer.status === 'Deleted').length;
  const categories = new Set(reportData.map(timer => timer.category)).size;

  // Calculate average time per timer (excluding deleted ones for a more meaningful metric)
  const activeTimers = reportData.filter(timer => timer.status !== 'Deleted');
  const averageTime = activeTimers.length > 0 ? 
    activeTimers.reduce((sum, timer) => sum + timer.totalTimeMs, 0) / activeTimers.length : 0;

  // Find most used category
  const categoryCount = reportData.reduce((acc, timer) => {
    const category = timer.category;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostUsedCategory = Object.entries(categoryCount).reduce(
    (max, [category, count]) => count > max.count ? { category, count } : max,
    { category: 'None', count: 0 }
  );

  if (!subscribed) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Reports Summary</h3>
          <PremiumBadge />
        </div>
        <PremiumFeatureGate 
          feature="Advanced Reports & Analytics" 
          description="Get detailed insights into your productivity with comprehensive reports, time tracking analytics, and export capabilities."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTime(totalTime)}</div>
          <p className="text-xs text-muted-foreground">
            Across {reportData.length} timer{reportData.length !== 1 ? 's' : ''}
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
          <CardTitle className="text-sm font-medium">Deleted Timers</CardTitle>
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{deletedTimers}</div>
          <p className="text-xs text-muted-foreground">
            Moved to history
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
            Per active timer
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
