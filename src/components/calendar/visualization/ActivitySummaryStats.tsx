
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TimerSessionWithTimer } from "../../../types";

interface ActivitySummaryStatsProps {
  sessions: TimerSessionWithTimer[];
}

const ActivitySummaryStats: React.FC<ActivitySummaryStatsProps> = ({ sessions }) => {
  // Calculate summary statistics
  const totalSessions = sessions.filter(s => s.duration_ms && s.duration_ms > 0).length;
  const totalTime = sessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
  const avgSessionTime = totalSessions > 0 ? totalTime / totalSessions : 0;
  const uniqueTimers = new Set(sessions.map(s => s.timer_id)).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalSessions}</div>
          <p className="text-sm text-blue-700 dark:text-blue-300">Total Sessions</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{(totalTime / (1000 * 60 * 60)).toFixed(1)}h</div>
          <p className="text-sm text-green-700 dark:text-green-300">Total Time</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{(avgSessionTime / (1000 * 60)).toFixed(0)}m</div>
          <p className="text-sm text-orange-700 dark:text-orange-300">Avg Session</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{uniqueTimers}</div>
          <p className="text-sm text-purple-700 dark:text-purple-300">Active Timers</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivitySummaryStats;
