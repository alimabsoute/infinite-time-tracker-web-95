
import React, { useMemo } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { Button } from "@shared/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, TrendingUp } from 'lucide-react';
import { Badge } from "@shared/components/ui/badge";
import { TimerSessionWithTimer } from "../../types";
import { getSessionsForDateRange } from "./CalendarUtils";

interface SmartWeekNavigationProps {
  currentWeekStart: Date;
  onNavigateWeek: (direction: 'previous' | 'next') => void;
  sessions: TimerSessionWithTimer[];
  onJumpToDataWeek?: (weekStart: Date) => void;
}

const SmartWeekNavigation: React.FC<SmartWeekNavigationProps> = ({
  currentWeekStart,
  onNavigateWeek,
  sessions,
  onJumpToDataWeek
}) => {
  // Find weeks with significant data (more than 1 hour of activity)
  const weeksWithData = useMemo(() => {
    if (!sessions.length) return [];

    const weekMap = new Map<string, { weekStart: Date; totalTime: number; sessionCount: number }>();
    
    sessions.forEach(session => {
      if (session.start_time && session.duration_ms) {
        const sessionDate = new Date(session.start_time);
        const weekStart = startOfWeek(sessionDate);
        const weekKey = format(weekStart, 'yyyy-MM-dd');
        
        const existing = weekMap.get(weekKey) || { weekStart, totalTime: 0, sessionCount: 0 };
        existing.totalTime += session.duration_ms;
        existing.sessionCount += 1;
        weekMap.set(weekKey, existing);
      }
    });

    return Array.from(weekMap.values())
      .filter(week => week.totalTime > 3600000) // More than 1 hour
      .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());
  }, [sessions]);

  // Get current week data
  const currentWeekData = useMemo(() => {
    const weekEnd = addDays(currentWeekStart, 6);
    const weekSessions = getSessionsForDateRange(currentWeekStart, weekEnd, sessions);
    const totalTime = weekSessions.reduce((sum, session) => sum + (session.duration_ms || 0), 0);
    return { sessionCount: weekSessions.length, totalTime };
  }, [currentWeekStart, sessions]);

  // Find nearest weeks with data
  const nearestDataWeeks = useMemo(() => {
    const currentTime = currentWeekStart.getTime();
    const previous = weeksWithData.find(week => week.weekStart.getTime() < currentTime);
    const next = weeksWithData.find(week => week.weekStart.getTime() > currentTime);
    return { previous, next };
  }, [weeksWithData, currentWeekStart]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-3">
      {/* Main Navigation */}
      <div className="flex flex-row items-center justify-between">
        <div className="text-center">
          <div className="text-sm font-medium">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </div>
          {currentWeekData.totalTime > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {formatTime(currentWeekData.totalTime)} • {currentWeekData.sessionCount} sessions
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <Button 
            onClick={() => onNavigateWeek('previous')} 
            size="sm" 
            variant="outline" 
            className="h-8 w-8 p-0 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => onNavigateWeek('next')} 
            size="sm" 
            variant="outline" 
            className="h-8 w-8 p-0 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Data Status and Smart Navigation */}
      {currentWeekData.totalTime === 0 && weeksWithData.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-2">
                No timer data for this week. Jump to weeks with activity:
              </p>
              <div className="flex flex-wrap gap-2">
                {nearestDataWeeks.previous && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-yellow-300 hover:bg-yellow-100"
                    onClick={() => onJumpToDataWeek?.(nearestDataWeeks.previous!.weekStart)}
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    {format(nearestDataWeeks.previous.weekStart, 'MMM d')}
                    <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
                      {formatTime(nearestDataWeeks.previous.totalTime)}
                    </Badge>
                  </Button>
                )}
                {nearestDataWeeks.next && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-yellow-300 hover:bg-yellow-100"
                    onClick={() => onJumpToDataWeek?.(nearestDataWeeks.next!.weekStart)}
                  >
                    {format(nearestDataWeeks.next.weekStart, 'MMM d')}
                    <ChevronRight className="h-3 w-3 ml-1" />
                    <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
                      {formatTime(nearestDataWeeks.next.totalTime)}
                    </Badge>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Week Indicator */}
      {currentWeekData.totalTime > 0 && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-2">
          <div className="flex items-center gap-2 text-xs text-green-800 dark:text-green-200">
            <TrendingUp className="h-3 w-3" />
            <span>Active week with {currentWeekData.sessionCount} timer sessions</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartWeekNavigation;
